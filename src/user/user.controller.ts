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
  UseInterceptors,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, maxSizeFile } from '../common/helpers/fileFilter.helper';
import { GenericResponse } from '../common/swagger/response';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger(UserController.name);

  @Auth('admin')
  @Post()
  @ApiOperation({ summary: 'Creacion de nuevo usuario' })
  @ApiResponse(UserReponse.createUser)
  create(@Body() createUserDto: CreateUserDto) {
    this.logger.log('Creando usuario');
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listado de todos los usuarios' })
  @ApiResponse(UserReponse.findAll)
  findAll() {
    this.logger.log('Listando Usuarios');
    return this.userService.findAll();
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
  @ApiResponse(GenericResponse.response)
  update(@Body() updateUserDto: UpdateUserDto) {
    this.logger.log('Actualizando usuario');
    return this.userService.update(updateUserDto);
  }

  @Auth('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario del sistema' })
  @ApiResponse(GenericResponse.response)
  remove(@Param() deleteUserDto: DeleteUserDto) {
    this.logger.log('Eliminando usuario');
    return this.userService.remove(deleteUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/photo')
  @ApiOperation({ summary: 'Registar la foto del usuario , no mayor 5MB' })
  @UseInterceptors(FileInterceptor('file', { fileFilter: fileFilter }))
  @ApiResponse(GenericResponse.response)
  savePhotoUser(@UploadedFile() file: Express.Multer.File, @User() user: UserEntity) {
    this.logger.log('Registrando foto usuario');
    maxSizeFile(file);
    return this.userService.savePhotoUser(file, user);
  }
}
