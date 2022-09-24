import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Logger,
  UseGuards,
  Param,
  CacheInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteUserDto } from './dto/delete-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User as UserEntity } from '../user/entities/user.entity';
import { UserDecorator as User } from '../common/decorators/user.decorator';
import { Auth } from '../common/decorators/auth.decorator';
import { UserReponse } from '../common/swagger/response/user.response';

@ApiTags('Users')
@ApiBearerAuth()
@UseInterceptors(CacheInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger(UserController.name);

  //@Auth('admin')
  @Post()
  @ApiOperation({ summary: 'Creacion de nuevo usuario' })
  @ApiResponse(UserReponse.createUser)
  create(@Body() createUserDto: CreateUserDto) {
    this.logger.log('Creando usuario');
    return this.userService.create(createUserDto);
  }

  @Auth('admin')
  @Get()
  @ApiOperation({ summary: 'Listado de todos los usuarios' })
  @ApiResponse(UserReponse.findAll)
  async findAll() {
    this.logger.log('Listando Usuarios');
    const users = await this.userService.findAll();
    if (users.length === 0) {
      this.logger.warn('No se encontraron usuarios');
      return { message: 'No users found' };
    }
    return users;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  @ApiOperation({ summary: 'Obtener perfil personal por usuario logeado' })
  @ApiResponse(UserReponse.profile)
  async profile(@User() user: UserEntity) {
    this.logger.log({ message: `Perfil del usuario obtenido`, user });
    return this.userService.getUserById(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  @ApiOperation({ summary: 'Actualizar usuario de manera administrativa' })
  @ApiResponse(UserReponse.genericReponse)
  update(@Body() updateUserDto: UpdateUserDto) {
    this.logger.log('Actualizando usuario');
    return this.userService.update(updateUserDto);
  }

  @Auth('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario del sistema' })
  @ApiResponse(UserReponse.genericReponse)
  remove(@Param() deleteUserDto: DeleteUserDto) {
    this.logger.log('Eliminando usuario');
    return this.userService.remove(deleteUserDto);
  }
}
