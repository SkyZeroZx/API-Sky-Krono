import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserDecorator as User } from '../common/decorators/user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
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
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Autentificacion')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login del usuario' })
  @ApiResponse(AuthResponse.login)
  async login(@Body() _loginDto: LoginDto, @User() user: UserEntity) {
    this.logger.log({ message: 'Logeando usuario', user });
    return this.authService.generateToken(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('generate-registration-options')
  @ApiOperation({ summary: 'Generacion de opciones webAuthn para usuario logeado' })
  @ApiBearerAuth()
  async generateRegistration(@User() user: UserEntity) {
    this.logger.log('generate-registration-options');
    const userAuthenticators = await this.authService.getUserAuthenticatorsByUsername(
      user.username,
    );
    const register = generateRegistrationOption(user, userAuthenticators);
    await this.authService.registerCurrentChallenge(user, register.challenge);
    return register;
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-registration')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registro de webAuthn para usuario logeado' })
  async verifyRegistration(@Body() verify, @User() user: UserEntity) {
    this.logger.log('Verificando registro Authn Web');
    const { currentChallenge } = await this.authService.getCurrentChallenge(user.username);
    const verifyAuthentication = await verifyAuthWeb(verify, currentChallenge);
    return this.authService.saveUserAuthenticators(user, verify.id, verifyAuthentication);
  }

  @Post('generate-authentication-options')
  @ApiOperation({ summary: 'Generacion de autentificador usuario a logear' })
  async generateAuthenticationOptions(@Body() user) {
    this.logger.log({ message: 'Generando Authentication Options Authn Web username', user });
    const userAuthenticators = await this.authService.getUserAuthenticatorsByUsername(
      user.username,
    );
    this.logger.log('userAuthenticators ', userAuthenticators);
    const authOptions = await generateAuthenticationOption(userAuthenticators);
    await this.authService.registerCurrentChallenge(user, authOptions.challenge);
    this.logger.log({ message: 'Se genero authOptions', authOptions });
    return authOptions;
  }

  @Post('verify-authentication')
  @ApiOperation({ summary: 'Verificacion y login de autentificador usuario a logear' })
  async verifityAuthentication(@Body() data) {
    this.logger.log({ message: 'Se recibio', data });
    this.logger.log({ message: 'Verificando Authentication Authn Web' });
    const { currentChallenge } = await this.authService.getCurrentChallenge(data.username);
    const userAuthenticators = await this.authService.getUserAuthenticatorsById(
      data.username,
      data.id,
    );
    const verifyOptions = await verifyAuthenticationOption(
      data,
      currentChallenge,
      userAuthenticators,
    );
    this.logger.log({ message: 'verifyOptions', verifyOptions });
    if (verifyOptions.verified) {
      Object.assign(verifyOptions, {
        data: await this.authService.generateTokenWithAuthnWeb(data.username),
      });
    }
    return verifyOptions;
  }

  @Auth('admin')
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
  async changePassword(@User() user: UserEntity, @Body() changePasswordDto: ChangePasswordDto) {
    this.logger.log({ message: 'Cambiando contraseña del usuario a demanda', user });
    return this.authService.changePassword(user, changePasswordDto);
  }
}
