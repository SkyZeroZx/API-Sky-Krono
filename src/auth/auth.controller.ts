import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserDecorator as User } from '../common/decorators/user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Constant } from '../common/constants/Constant';
import { LoginDto } from './dtos/login.dto';
import { ResetUserDto } from './dtos/reset.dto';
import { ChangePasswordDto } from './dtos/changePasssword.dto';
import { AuthResponse } from '../common/swagger/response/auth.response';
import {
  generateRegistrationOption,
  verifyAuthWeb,
  generateAuthenticationOption,
  verifyAuthenticationOption,
} from '../config/webAuthentication/webAuthn';

@ApiTags('Autentificacion')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);
  rememberChallenge: any;

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login del usuario' })
  @ApiResponse(AuthResponse.login)
  async login(@Body() _loginDto: LoginDto, @User() user: UserEntity) {
    this.logger.log('Retornando datos');
    // Segun el status de nuestro usuario retornamos una respuesta
    switch (user.status) {
      case Constant.STATUS_USER.CREADO:
      case Constant.STATUS_USER.HABILITADO:
      case Constant.STATUS_USER.RESETEADO:
        const data = this.authService.generateToken(user);
        Object.assign(data, { message: Constant.MENSAJE_OK });
        return data;
      default:
        return { message: `El usuario tiene un status ${user.status}` };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('generate-registration-options')
  @ApiOperation({ summary: 'Generacion de opciones webAuthn para usuario logeado' })
  @ApiBearerAuth()
  async generateRegistration(@User() user: UserEntity) {
    this.logger.log('generate-registration-options');
    const userAuthenticators = await this.authService.getUserAuthenticators(user);
    const register = generateRegistrationOption(user, userAuthenticators);
    this.rememberChallenge = register.challenge;
    return register;
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-registration')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registro de webAuthn para usuario logeado' })
  async verifyRegistration(@Body() verify, @User() user: UserEntity) {
    this.logger.log('Verificando registro Authn Web');
    const verifyAuthentication = await verifyAuthWeb(verify, this.rememberChallenge);
    return this.authService.saveUserAuthenticators(user, verify.id, verifyAuthentication);
  }

  @Post('generate-authentication-options')
  @ApiOperation({ summary: 'Generacion de autentificador usuario a logear' })
  async generateAuthenticationOptions(@Body() user) {
    this.logger.log('Generando Authentication Options Authn Web username', user.username);
    const userAuthenticators = await this.authService.getUserAuthenticatorsByUsername(
      user.username,
    );
    this.logger.log('userAuthenticators ', userAuthenticators);
    const authOptions = await generateAuthenticationOption(userAuthenticators);
    this.rememberChallenge = authOptions.challenge;
    this.logger.log('Se genero authOptions', authOptions);
    return authOptions;
  }

  @Post('verify-authentication')
  @ApiOperation({ summary: 'Verificacion y login de autentificador usuario a logear' })
  async verifityAuthentication(@Body() data) {
    this.logger.log('Se recibio', data);
    this.logger.log('Verificando Authentication Authn Web');
    let username = data.username;
    delete data.username;
    const userAuthenticators = await this.authService.getUserAuthenticatorsById(username, data.id);
    const verifyOptions = await verifyAuthenticationOption(
      data,
      this.rememberChallenge,
      userAuthenticators,
    );
    this.logger.log('verifyOptions', verifyOptions);
    if (verifyOptions['verified']) {
      Object.assign(verifyOptions, {
        data: await this.authService.generateTokenWithAuthnWeb(username),
      });
    }
    return verifyOptions;
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reseteo de contraseña administrativo' })
  @ApiResponse(AuthResponse.resetPassword)
  async resetPassword(@Body() resetUserDto: ResetUserDto) {
    this.logger.log(`Reseteando usuario ${resetUserDto.username}`);
    const { username } = resetUserDto;
    return this.authService.resetPassword(username);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambio de contraseña a demanda por usuario logeado' })
  @ApiResponse(AuthResponse.changePassword)
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @User() user: UserEntity) {
    this.logger.log(`Cambiando contraseña usuario ${user.username}`);
    const { oldPassword, newPassword } = changePasswordDto;
    if (oldPassword == newPassword) {
      this.logger.warn('No puede repetir la contraseña antigua para la nueva contraseña');
      throw new BadRequestException({
        message: 'No puede repetir la contraseña antigua para la nueva contraseña',
      });
    }
    user.password = newPassword;
    // En caso sea el primer cambio de contraseña o reseteado cambiamos el status a false
    user.firstLogin = false;
    // Al ser cambio de contraseña el status pasa a ser habilitado
    user.status = Constant.STATUS_USER.HABILITADO;
    return this.authService.changePassword(user, oldPassword);
  }
}
