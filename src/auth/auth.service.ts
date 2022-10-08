import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Authentication)
    private readonly autenticationRepository: Repository<Authentication>,
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
    const user = await this.userService.findByEmail(email);
    if (typeof user.user == 'undefined') {
      this.logger.warn(`Login fallido usuario: ${email}`);
      return null;
    }

    if (user && (await compare(pass, user.user.password))) {
      delete user.message;
      user.message = Constants.MSG_OK;
      delete user.user.password;
      this.logger.log(`Login exitoso usuario: ${email}`);
      return user.user;
    }
    return null;
  }

  /**
   * It takes a user object and an old password, and if the old password matches the user's current
   * password, it returns the result of the userService.saveNewPassword() function
   * @param {User} user - User: The user object that contains the new password.
   * @param {string} oldPassword - The old password of the user.
   * @returns a promise that resolves to an object with a message property.
   */
  async changePassword(user: User, oldPassword: string) {
    const findUser = await this.userService.findByEmail(user.username);
    if (user && (await compare(oldPassword, findUser.user.password))) {
      this.logger.log('Se valido que contraseña antigua coincide con la contraseña actual');
      return this.userService.saveNewPassword(user);
    }
    this.logger.warn('Antigua contraseña no coincidio con la contraseña actual');

    throw new InternalServerErrorException({
      message: 'Hubo un error al cambiar la contraseña , validar',
    });
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
      // Salvamos la nueva contraseña con sus datos del usuario reseteado
      const response = await this.userService.saveNewPassword(userReset);
      if (response.message == Constants.MSG_OK) {
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
      }
      this.logger.error('No se pudo resetear la contraseña');
      throw new InternalServerErrorException({
        message: 'Hubo un error al enviar el correo de reseteo',
      });
    } catch (error) {
      this.logger.error('Hubo un error al enviar el correo de reseteo');
      throw new InternalServerErrorException({
        message: 'Hubo un error al enviar el correo de reseteo',
      });
    }
  }

  /**
   * It returns a list of all the authenticators associated with a user
   * @param {User} user - User - The user object that was passed to the method.
   * @returns An array of Authenticator objects.
   */
  async getUserAuthenticators(user: User): Promise<Authentication[]> {
    return this.autenticationRepository.find({
      where: {
        codUser: user.id,
      },
    });
  }

  /**
   * It returns the authenticator with the given id for the user with the given username
   * @param {string} username - username of the user
   * @param {string} id - The id of the authenticator you want to get.
   * @returns The user authenticators by id
   */
  async getUserAuthenticatorsById(username: string, id: string): Promise<Authentication[]> {
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
  async saveUserAuthenticators(user: User, id: string, data: any) {
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
   * @param {User} user - User - the user object that we are generating the token for
   * @returns The user object with a token property.
   */
  generateToken(user: User) {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      firstLogin: user.firstLogin,
    };
    return {
      ...user,
      token: this.jwtService.sign(payload),
    };
  }

  /**
   * It takes a email, finds the user in the database, deletes the password from the user object, and
   * then generates a token with the user object
   * @param {string} email - The email of the user to be authenticated.
   * @returns A token
   */
  async generateTokenWithAuthnWeb(email: string) {
    const user = await this.userService.findByEmail(email);
    delete user.user.password;
    return this.generateToken(user.user);
  }
}
