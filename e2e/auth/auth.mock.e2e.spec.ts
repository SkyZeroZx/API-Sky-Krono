import { ChangePasswordDto } from '../../src/auth/dtos/changePasssword.dto';
import { LoginDto } from '../../src/auth/dtos/login.dto';
import { ResetUserDto } from '../../src/auth/dtos/reset.dto';
import { Constants } from '../../src/common/constants/Constant';
import { User } from '../../src/user/entities/user.entity';

export class AuthMockServiceE2E {
  public save = jest.fn();

  public create = jest.fn();

  public delete = jest.fn().mockReturnThis();

  public generateTokenWithAuthnWeb = jest.fn().mockReturnThis();

  public resetPassword = jest.fn();

  public saveNewPassword = jest.fn().mockReturnThis();

  public getRequest = jest.fn().mockReturnThis();
  // Is function for mock configService
  public get = jest.fn().mockReturnThis();

  public validateUser = jest.fn().mockReturnThis();

  public getUserById = jest.fn().mockReturnThis();

  public createQueryBuilder = jest.fn(() => ({
    where: this.where,
    select: this.select,
    update: this.update,
    addSelect: this.addSelect,
    innerJoin: this.innerJoin,
    getRawMany: this.getRawMany,
    execute: this.execute,
    set: this.set,
    getRawOne: this.getRawOne,
  }));

  public update = jest.fn().mockReturnThis();
  public set = jest.fn().mockReturnThis();

  public changePassword = jest.fn().mockReturnThis();

  public getUserAuthenticators = jest.fn().mockReturnThis();

  public getUserAuthenticatorsById = jest.fn().mockReturnThis();

  public getUserAuthenticatorsByUsername = jest.fn().mockReturnThis();

  public findByEmail = jest.fn().mockReturnThis();

  public saveTaskToUser = jest.fn().mockReturnThis();

  public findAndCount = jest.fn().mockReturnThis();

  public removeUserToTask = jest.fn().mockReturnThis();

  public where = jest.fn().mockReturnThis();

  public select = jest.fn().mockReturnThis();

  public execute = jest.fn().mockReturnThis();

  public getRawMany = jest.fn().mockReturnThis();

  public innerJoin = jest.fn().mockReturnThis();

  public generateToken = jest.fn().mockReturnThis();

  public find = jest.fn().mockReturnThis();

  public addSelect = jest.fn().mockReturnThis();

  public getRawOne = jest.fn().mockReturnThis();

  public static readonly token: string = 'SoyElToken';

  public static readonly userMockData = {
    email: 'test@example.com',
    pass: '123456',
    codUser: '1',
  };

  public static readonly userResetado: User = {
    id: 0,
    username: 'skyzerozx@mail.com',
    password: '123456',
    role: 'admin',
    createdAt: new Date(),
    updateAt: new Date(),
    name: 'name TEST',
    fatherLastName: 'Paterno TEST',
    motherLastName: 'Materno TEST',
    status: Constants.STATUS_USER.RESETEADO,
    firstLogin: false,
    hashPassword: function (): Promise<void> {
      return;
    },
    firstLoginStatus: function (): Promise<void> {
      return;
    },
  };

  public static readonly loginDto: LoginDto = {
    username: 'skyzerozx',
    password: '12345',
  };

  public static readonly dataWebAuthn = {
    registrationInfo: {
      counter: 0,
    },
    credentialPublicKey: Buffer,
    credentialID: Buffer,
  };

  public static readonly resetUserDto: ResetUserDto = {
    username: 'SkyZeroZx',
  };

  public static readonly changePasswordDto: ChangePasswordDto = {
    oldPassword: '123456',
    newPassword: '555555',
  };

  public static readonly userReset: User = {
    id: 1,
    username: 'RESET',
    password: 'RESET',
    role: 'admin',
    createdAt: new Date(),
    updateAt: new Date(),
    name: 'RESET',
    fatherLastName: 'RESET',
    motherLastName: 'RESET',
    status: Constants.STATUS_USER.RESETEADO,
    firstLogin: false,
    hashPassword: function (): Promise<void> {
      return;
    },
    firstLoginStatus: function (): Promise<void> {
      return;
    },
  };

  public static readonly userCreate: User = {
    id: 1,
    username: 'CREADO',
    password: 'CREADO',
    role: 'admin',
    createdAt: new Date(),
    updateAt: new Date(),
    name: 'CREADO',
    fatherLastName: 'CREADO',
    motherLastName: 'CREADO',
    status: Constants.STATUS_USER.CREADO,
    firstLogin: false,
    hashPassword: function (): Promise<void> {
      return;
    },
    firstLoginStatus: function (): Promise<void> {
      return;
    },
  };

  public static readonly userHabilitado: User = {
    id: 1,
    username: 'TEST HABILITADO',
    password: 'TEST',
    role: 'ADMIN',
    createdAt: new Date(),
    updateAt: new Date(),
    name: 'HABILITADO',
    fatherLastName: 'HABILITADO',
    motherLastName: 'HABILITADO',
    status: Constants.STATUS_USER.HABILITADO,
    firstLogin: false,
    hashPassword: function (): Promise<void> {
      return;
    },
    firstLoginStatus: function (): Promise<void> {
      return;
    },
  };

  public static readonly userBloq: User = {
    id: 1,
    username: 'BLOQUEADO',
    password: 'BLOQUEADO',
    role: 'admin',
    createdAt: new Date(),
    updateAt: new Date(),
    name: 'BLOQUEADO',
    fatherLastName: 'BLOQUEADO',
    motherLastName: 'BLOQUEADO',
    status: Constants.STATUS_USER.BLOQUEADO,
    firstLogin: false,
    hashPassword: function (): Promise<void> {
      return;
    },
    firstLoginStatus: function (): Promise<void> {
      return;
    },
  };

  public static readonly verifyAuthWeb = {
    verified: true,
    registrationInfo: {
      fmt: null,
      counter: 0,
      aaguid: null,
      credentialID: null,
      credentialPublicKey: null,
      credentialType: 'public-key',
      attestationObject: null,
      userVerified: true,
      credentialDeviceType: null,
      credentialBackedUp: true,
      authenticatorExtensionResults: null,
    },
  };

  public static readonly generateRegistrationOption = {
    user: null,
    challenge: null,
    excludeCredentials: [],
    extensions: null,
    pubKeyCredParams: [],
    rp: null,
  };

  public static readonly verifityAuthenticationOption = {
    verified: true,
    authenticationInfo: {
      credentialID: null,
      newCounter: 1,
      credentialDeviceType: null,
      credentialBackedUp: false,
    },
  };
}
