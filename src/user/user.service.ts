import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Constants } from '../common/constants/Constant';
import { transporter } from '../config/mailer/mailer';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { generate } from 'generate-password';
import { Chargue } from '../chargue/entities/chargue.entity';
import { Schedule } from '../schedule/entities/schedule.entity';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { fileNamer } from '../common/helpers';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { message } = await this.findByEmail(createUserDto.username);
    if (message !== Constants.MSG_OK) {
      return { message: message };
    }

    let user = createUserDto as User;
    let generatePassword;
    try {
      generatePassword = generate({
        length: 10,
        numbers: true,
      });
      user.password = generatePassword;
      const newUser = this.userRepository.create(user);
      user = await this.userRepository.save(newUser);
    } catch (error) {
      this.logger.error({ message: `Sucedio un error al crear al usuario`, error });
      throw new InternalServerErrorException({ message: 'Sucedio un error al crear al usuario' });
    }

    try {
      await transporter.sendMail({
        from: 'Sky Krono',
        to: createUserDto.username,
        subject: 'Creacion de nuevo usuario SkyKrono',
        html: Constants.replaceText(
          ['{{username}}', '{{randomPassword}}'],
          [createUserDto.username, generatePassword],
          Constants.MAIL.CREATE_NEW_USER,
        ),
      });
      this.logger.log(
        `Correo de creacion del usuario ${createUserDto.username} enviado exitosamente`,
      );
    } catch (error) {
      this.logger.error({ message: ' Hubo un error al enviar el correo de creacion', error });
      throw new InternalServerErrorException('Hubo un error al enviar el correo de creacion');
    }

    delete user.password;
    this.logger.log({ message: `Usuario creado exitosamente`, user });
    return {
      message: Constants.MSG_OK,
      info: 'Usuario Creado Correctamente',
      user,
    };
  }

  async findByEmail(email: string) {
    let user: User;
    try {
      user = await this.userRepository
        .createQueryBuilder('user')
        .where({
          username: email,
        })
        .addSelect('user.password')
        .getOne();
      if (user) {
        this.logger.log(`El correo del usuario ${email} se encuentra registrado`);
        return {
          message: 'El correo del usuario ya existe',
          user,
        };
      }
    } catch (error) {
      this.logger.error(`Sucedio un error al realizar la busqueda del usuario ${email}`, { error });
      throw new InternalServerErrorException({ message: 'Sucedio un error' });
    }
    return { message: Constants.MSG_OK };
  }

  async findAll() {
    return this.userRepository
      .createQueryBuilder('USER')
      .select('USER.id', 'id')
      .addSelect('USER.username', 'username')
      .addSelect('USER.name', 'name')
      .addSelect('USER.fatherLastName', 'fatherLastName')
      .addSelect('USER.motherLastName', 'motherLastName')
      .addSelect('USER.createdAt', 'createdAt')
      .addSelect('USER.updateAt', 'updateAt')
      .addSelect('USER.status', 'status')
      .addSelect('USER.role', 'role')
      .addSelect('USER.photo', 'photo')
      .addSelect('USER.phone', 'phone')
      .addSelect('CHARGUE.id', 'codChargue')
      .addSelect('SCHEDULE.id', 'codSchedule')
      .addSelect('CHARGUE.name', 'chargue')
      .addSelect('SCHEDULE.name', 'schedule')
      .innerJoin(Chargue, 'CHARGUE', 'CHARGUE.id = USER.codChargue')
      .innerJoin(Schedule, 'SCHEDULE', 'SCHEDULE.id = USER.codSchedule')
      .cache(1000)
      .getRawMany();
  }

  async update(updateUserDto: UpdateUserDto) {
    try {
      const userUpdate = this.userRepository.create({
        name: updateUserDto.name,
        motherLastName: updateUserDto.motherLastName,
        fatherLastName: updateUserDto.fatherLastName,
        role: updateUserDto.role,
        status: updateUserDto.status,
        phone: updateUserDto.phone,
        codChargue: updateUserDto.codChargue,
        codSchedule: updateUserDto.codSchedule,
      });
      await this.userRepository.update(updateUserDto.id, userUpdate);
    } catch (error) {
      this.logger.error({
        message: `Sucedio un error al actualizar al usuario ${updateUserDto.username}`,
        error,
      });
      throw new InternalServerErrorException('Sucedio un error al actualizar al usuario');
    }

    this.logger.log({ message: `Se actualizo exitosamente el usuario`, updateUserDto });
    return {
      message: Constants.MSG_OK,
      info: 'Usuario Actualizado Correctamente',
    };
  }

  async remove(deleteUserDto: DeleteUserDto) {
    try {
      await this.userRepository.delete(deleteUserDto.id);
    } catch (error) {
      this.logger.error({ message: `Sucedio un error al eliminar al usuario`, error });
      throw new InternalServerErrorException({
        message: 'Sucedio un error al eliminar al usuario',
      });
    }

    this.logger.log({ message: 'Se elimino exitosamente al usuario ', deleteUserDto });
    return {
      message: Constants.MSG_OK,
      info: 'Usuario Eliminado Correctamente',
    };
  }

  async getUserById(userId: number) {
    this.logger.log(`Buscando usuario con id ${userId}`);
    try {
      return await this.userRepository.findOneOrFail({
        where: { id: userId },
      });
    } catch (error) {
      this.logger.error(`Sucedio un error al buscar el usuario con id ${userId}`);
      this.logger.error(error);
      throw new InternalServerErrorException('Sucedio un error al buscar el usuario');
    }
  }

  async saveNewPassword(user: User) {
    try {
      const userCreateNewPassword = this.userRepository.create({
        username: user.username,
        password: user.password,
        firstLogin: user.firstLogin,
        status: user.status,
      });
      userCreateNewPassword.hashPassword();
      const { affected } = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          password: userCreateNewPassword.password,
          firstLogin: userCreateNewPassword.firstLogin,
          status: userCreateNewPassword.status,
        })
        .where('username = :username', { username: userCreateNewPassword.username })
        .execute();
      if (affected == 1) {
        this.logger.log(`Se cambio satisfactoriamente la contraseña del usuario ${user.username}`);
        return { message: Constants.MSG_OK, info: 'Se cambio exitosamente la contraseña' };
      }
      this.logger.warn(`Sucedio un error al cambiar la contraseña , usuario : ${user.username}`);
      throw new InternalServerErrorException('Sucedio un error al cambiar la contraseña');
    } catch (error) {
      this.logger.error(`Sucedio un error al cambiar la contraseña del usuario ${user.username}`);
      this.logger.error(error);
      throw new InternalServerErrorException('Sucedio un error al cambiar la contraseña');
    }
  }

  async savePhotoUser(file: Express.Multer.File, { username, id }: User) {
    this.logger.log(`Registrando el avatar del usuario ${username}`);
    try {
      const { Location } = await this.awsS3Service.uploadFile(
        file.buffer,
        fileNamer(file, username),
      );
      await this.userRepository.update({ id }, { photo: Location });
      return { message: Constants.MSG_OK, info: 'Se subio exitosamente la foto' };
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al subir foto del usuario', error });
      throw new InternalServerErrorException('Sucedio un error al subir su foto');
    }
  }
}
