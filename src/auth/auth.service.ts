import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Constants } from '../common/constants/Constant';
import { UserService } from '../user/user.service';
import { compare } from 'bcryptjs';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { transporter } from '../config/mailer/mailer';
import { generate } from 'generate-password';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authentication } from './entities/autentication.entity';
import { Challenge } from './entities/challenge.entity';
import { ChangePasswordDto } from './dtos/changePasssword.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Authentication)
    private readonly autenticationRepository: Repository<Authentication>,
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    private readonly userService: UserService,
  ) {}

  /**
   * It takes an email and password, finds the user in the database, and if the password matches, returns
   * the user
   * @param {string} email - The email address of the user.
   * @param {string} pass - The password to be hashed.
   * @returns The user object is being returned.
   */
  async validateUser(email: string, pass: string) {
    this.logger.log('Validando Usuario', AuthService.name);
    const { user } = await this.userService.findUserByEmail(email);
    if (typeof user == 'undefined') {
      this.logger.warn(`Login fallido usuario: ${email}`);
      return null;
    }

    if (user && (await compare(pass, user.password))) {
      delete user.password;
      this.logger.log(`Login exitoso usuario: ${email}`);
      return user;
    }
    return null;
  }

  /**
   * It takes a user and a ChangePasswordDto, and returns a Promise of a User
   * @param {User} user - User: The user object that is currently logged in.
   * @param {ChangePasswordDto}  - user: User - The user object that was retrieved from the database.
   * @returns The user object
   */
  async changePassword(user: User, { oldPassword, newPassword }: ChangePasswordDto) {
    if (oldPassword == newPassword) {
      this.logger.warn('No puede repetir la contraseña antigua para la nueva contraseña');
      throw new BadRequestException({
        message: 'No puede repetir la contraseña antigua para la nueva contraseña',
      });
    }
    user.password = newPassword;
    user.firstLogin = false;
    user.status = Constants.STATUS_USER.HABILITADO;
    const findUser = await this.userService.findUserByEmail(user.username);
    if (user && (await compare(oldPassword, findUser.user.password))) {
      this.logger.log('Se valido que contraseña antigua coincide con la contraseña actual');
      return this.userService.saveNewPassword(user);
    }
    this.logger.warn('Antigua contraseña no coincidio con la contraseña actual');
    throw new InternalServerErrorException('Hubo un error al cambiar la contraseña , validar');
  }

  async resetPassword(username: string) {
    const userReset = {
      username,
      password: generate({
        length: 10,
        numbers: true,
      }),
      status: Constants.STATUS_USER.RESETEADO,
      firstLogin: true,
    } as User;
    try {
      await this.userService.saveNewPassword(userReset);
      await transporter.sendMail({
        from: 'SkyKrono <sky-admin@gmail.com>',
        to: username,
        subject: 'Reseteo de contraseña',
        html: Constants.replaceText(
          ['{{username}}', '{{passwordReset}}'],
          [username, userReset.password],
          Constants.MAIL.RESET_PASSWORD,
        ),
      });
      this.logger.log(`Se envio correo de reseteo del usuario ${username}`);
      return { message: Constants.MSG_OK, info: 'Usuario reseteado exitosamente' };
    } catch (error) {
      this.logger.error('Hubo un error al enviar el correo de reseteo');
      throw new InternalServerErrorException('Hubo un error al enviar el correo de reseteo');
    }
  }

  /**
   * It returns the authenticator with the given id for the user with the given username
   * @param {string} username - username of the user
   * @param {string} id - The id of the authenticator you want to get.
   * @returns The user authenticator by id
   */
  async getUserAuthenticatorsById(username: string, id: string): Promise<Authentication> {
    return this.autenticationRepository
      .createQueryBuilder('AUTH')
      .select('AUTH.id', 'id')
      .addSelect('AUTH.codUser', 'codUser')
      .addSelect('AUTH.credentialID', 'credentialID')
      .addSelect('AUTH.credentialPublicKey', 'credentialPublicKey')
      .addSelect('AUTH.counter', 'counter')
      .innerJoin(User, 'USER', 'USER.id  = AUTH.codUser')
      .where('USER.username  = :username and AUTH.id =:id', {
        username: username,
        id: id,
      })
      .getRawOne();
  }

  /**
   * It returns the authenticators of a user, given the username
   * @param {string} username - The username of the user whose authenticators you want to retrieve.
   * @returns An array of objects with the following structure:
   * ```
   * [
   *   {
   *     id: 1,
   *     codUser: 1,
   *     credentialID: 'credentialID',
   *     credentialPublicKey: 'credentialPublicKey',
   *     counter: 1,
   *   }, ...
   * ]
   */
  async getUserAuthenticatorsByUsername(username: string): Promise<Authentication[]> {
    return this.autenticationRepository
      .createQueryBuilder('AUTH')
      .select('AUTH.id', 'id')
      .addSelect('AUTH.codUser', 'codUser')
      .addSelect('AUTH.credentialID', 'credentialID')
      .addSelect('AUTH.credentialPublicKey', 'credentialPublicKey')
      .addSelect('AUTH.counter', 'counter')
      .innerJoin(User, 'USER', 'USER.id  = AUTH.codUser')
      .where('USER.username  = :username', {
        username: username,
      })
      .getRawMany();
  }

  /**
   * It saves the user's authenticator information in the database.
   * @param {User} user - User, id: string, data: any
   * @param {string} id - The id of the user.
   * @param {any} data - The data returned from the browser.
   * @returns The user is being returned.
   */
  async saveUserAuthenticators(user: User, id: string, data: any): Promise<Authentication> {
    this.logger.log('Se esta registrando al usuario ', user);
    this.logger.log('Informacion recibida es ', data);
    const auth = this.autenticationRepository.create({
      id: id,
      counter: data.registrationInfo.counter,
      codUser: user.id,
      credentialPublicKey: data.registrationInfo.credentialPublicKey,
      credentialID: data.registrationInfo.credentialID,
    });
    return this.autenticationRepository.save(auth);
  }

  /**
   * It takes a user object, creates a payload object, and then returns a new object that contains the
   * user object and a token
   * @param {User} user - User - the user object that we are generating the token for login
   * @returns The user object with a token property.
   */
  generateToken(user: User) {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      firstLogin: user.firstLogin,
    };

    switch (user.status) {
      case Constants.STATUS_USER.CREADO:
      case Constants.STATUS_USER.HABILITADO:
      case Constants.STATUS_USER.RESETEADO:
        return {
          ...user,
          token: this.jwtService.sign(payload),
        };
      default:
        throw new BadRequestException(`El usuario tiene un status ${user.status}}`);
    }
  }

  /**
   * It takes a email, finds the user in the database, deletes the password from the user object, and
   * then generates a token with the user object
   * @param {string} email - The email of the user to be authenticated.
   * @returns A token
   */
  async generateTokenWithAuthnWeb(email: string) {
    const { user } = await this.userService.findUserByEmail(email);
    delete user.password;
    return this.generateToken(user);
  }

  async registerCurrentChallenge(user: User, challenge: string) {
    this.logger.log({ message: 'Registrando challenge user', user });
    try {
      await this.challengeRepository.upsert(
        { currentChallenge: challenge, username: user.username, codUser: user.id },
        { conflictPaths: ['username'] },
      );
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al registrar challenge user', error });
      throw new InternalServerErrorException('Sucedio un error al registrar challenge user');
    }
  }

  async getCurrentChallenge(username: string) {
    this.logger.log({ message: 'Buscando challenge user', username });
    try {
      return await this.challengeRepository.findOneOrFail({
        where: { username: username },
      });
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al obtener challenge user', error });
      throw new InternalServerErrorException('Sucedio un error al obtener challenge user');
    }
  }
}
