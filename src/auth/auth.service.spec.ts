import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { Constants } from '../common/constants/Constant';
import { transporter } from '../config/mailer/mailer';
import { User } from '../user/entities/user.entity';
import { UserServiceMock } from '../user/user.mock.spec';
import { UserService } from '../user/user.service';
import { AuthMockService } from './auth.mock.spec';
import { AuthService } from './auth.service';
import { Authentication } from './entities/autentication.entity';
import { Challenge } from './entities/challenge.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let mockService: AuthMockService = new AuthMockService();
  const { email, pass, codUser } = AuthMockService.userMockData;
  const { currentChallenge } = AuthMockService.challenge;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Authentication),
          useValue: mockService,
        },
        {
          provide: getRepositoryToken(Challenge),
          useValue: mockService,
        },
        {
          provide: JwtService,
          useValue: mockService,
        },
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('Validate validateUser', async () => {
    const { password: passwordEncripted } = UserServiceMock.mockFindAllUserData[0];

    const spyFindByEmail = jest
      .spyOn(userService, 'findUserByEmail')
      .mockImplementation(async () => {
        return { user: undefined, message: 'devolvi user undefined' };
      });
    const spyCompare = jest.spyOn(bcrypt, 'compare').mockImplementation(async () => {
      return true;
    });
    const validateUserNull = await authService.validateUser(email, pass);
    expect(spyFindByEmail).toBeCalledWith(email);
    expect(validateUserNull).toBeNull();
    expect(spyCompare).not.toBeCalled();
    spyFindByEmail.mockImplementation(async () => {
      return { user: UserServiceMock.mockFindAllUserData[0], message: Constants.MSG_OK };
    });

    const valiteUserOk = await authService.validateUser(email, pass);
    expect(spyCompare).toBeCalledWith(pass, passwordEncripted);
    expect(spyFindByEmail).toHaveBeenNthCalledWith(2, email);
    expect(valiteUserOk).toEqual(UserServiceMock.mockFindAllUserData[0]);
    expect(valiteUserOk.password).toBeUndefined();

    // Validamos para el caso que compare nos retorne false
    spyCompare.mockImplementationOnce(async () => {
      return false;
    });
    const valiteUserFalseCompare = await authService.validateUser(email, pass);
    expect(spyCompare).toBeCalledTimes(2);
    expect(spyFindByEmail).toHaveBeenNthCalledWith(3, email);
    expect(valiteUserFalseCompare).toBeNull();
  });

  it('Validate changePassword Ok', async () => {
    const spyFindByEmail = jest
      .spyOn(userService, 'findUserByEmail')
      .mockImplementation(async () => {
        return { user: UserServiceMock.mockFindAllUserData[0], message: Constants.MSG_OK };
      });
    const spyCompare = jest.spyOn(bcrypt, 'compare').mockImplementation(async () => {
      return true;
    });

    const spySaveNewPassword = jest
      .spyOn(userService, 'saveNewPassword')
      .mockImplementationOnce(async () => {
        return null;
      });

    await authService.changePassword(
      UserServiceMock.mockFindAllUserData[0],
      AuthMockService.changePasswordDto,
    );

    expect(spyFindByEmail).toBeCalled();
    expect(spyCompare).toBeCalled();
    expect(spySaveNewPassword).toBeCalled();
  });

  it('Validate ChangePassword error same oldPassword & newPassword', async () => {
    await expect(
      authService.changePassword(
        UserServiceMock.mockFindAllUserData[0],
        AuthMockService.samePassword,
      ),
    ).rejects.toThrowError(
      new BadRequestException({
        message: 'No puede repetir la contraseña antigua para la nueva contraseña',
      }),
    );
  });

  it('Validate changePassword Error', async () => {
    const { password: passwordEncripted } = UserServiceMock.mockFindAllUserData[0];
    const spyFindByEmail = jest
      .spyOn(userService, 'findUserByEmail')
      .mockImplementation(async () => {
        return { user: UserServiceMock.mockFindAllUserData[0], message: Constants.MSG_OK };
      });
    const spyCompare = jest.spyOn(bcrypt, 'compare').mockImplementation(async () => {
      return false;
    });

    const spySaveNewPassword = jest.spyOn(userService, 'saveNewPassword');

    await expect(
      authService.changePassword(
        UserServiceMock.mockFindAllUserData[0],
        AuthMockService.changePasswordDto,
      ),
    ).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Hubo un error al cambiar la contraseña , validar',
      }),
    );

    expect(spyFindByEmail).toBeCalled();
    expect(spyCompare).toBeCalledWith(pass, passwordEncripted);
    expect(spySaveNewPassword).not.toBeCalled();
  });

  it('Validate generateTokenWithAuthnWeb', async () => {
    const { password, ...user } = UserServiceMock.mockFindAllUserData[0];
    const spyJwtServiceSing = jest.spyOn(jwtService, 'sign');
    const spyFindByEmail = jest
      .spyOn(userService, 'findUserByEmail')
      .mockImplementation(async () => {
        return { user: UserServiceMock.mockFindAllUserData[0], message: Constants.MSG_OK };
      });

    const spyGenerateToken = jest.spyOn(authService, 'generateToken');
    const generateTokenWithAuthnWeb = await authService.generateTokenWithAuthnWeb(email);
    expect(spyGenerateToken).toHaveBeenCalledWith(user);
    expect(spyFindByEmail).toBeCalled();
    expect(spyJwtServiceSing).toBeCalledWith({
      userId: user.id,
      username: user.username,
      role: user.role,
      firstLogin: user.firstLogin,
    });
    expect(generateTokenWithAuthnWeb).toEqual({ ...user, token: AuthMockService.token });
  });

  it('Validate generateToken', async () => {
    const { password, ...user } = UserServiceMock.mockFindAllUserData[0];
    const spyJwtServiceSing = jest.spyOn(jwtService, 'sign');
    const generateToken = authService.generateToken(UserServiceMock.mockFindAllUserData[0]);
    expect(spyJwtServiceSing).toBeCalledWith({
      userId: user.id,
      username: user.username,
      role: user.role,
      firstLogin: user.firstLogin,
    });
    expect(generateToken).toEqual({ ...user, token: AuthMockService.token });
  });

  it('Validate generateToken status create', async () => {
    const spyJwtServiceSing = jest.spyOn(jwtService, 'sign');
    const userReseteado: User = {
      id: 1,
      username: 'skyzerozx@mail.com',
      role: 'admin',
      firstLogin: false,
      status: Constants.STATUS_USER.CREADO,
    } as any;
    authService.generateToken(userReseteado);
    expect(spyJwtServiceSing).toBeCalled();
  });

  it('Validate generateToken Status Invalid', async () => {
    const userInvalidStatus: User = {
      id: 1,
      username: 'skyzerozx@mail.com',
      role: 'admin',
      firstLogin: false,
      status: Constants.STATUS_USER.BLOQUEADO,
    } as any;

    try {
      authService.generateToken(userInvalidStatus);
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
    }
  });

  it('Validate resetPassword OK', async () => {
    const spySaveNewPassword = jest
      .spyOn(userService, 'saveNewPassword')
      .mockImplementationOnce(async () => {
        return { message: Constants.MSG_OK, info: 'Todo salio bien' };
      });
    const spyTransporterEmail = jest
      .spyOn(transporter, 'sendMail')
      .mockImplementationOnce(async () => {
        return null;
      });
    const resetPassword = await authService.resetPassword(email);
    expect(spySaveNewPassword).toBeCalled();
    expect(resetPassword).toEqual({
      message: Constants.MSG_OK,
      info: 'Usuario reseteado exitosamente',
    });
    expect(spyTransporterEmail).toBeCalled();
  });

  it('Validate resetPassword Error', async () => {
    const spySaveNewPassword = jest
      .spyOn(userService, 'saveNewPassword')
      .mockImplementationOnce(async () => {
        throw new InternalServerErrorException({
          message: 'Sucedio un error al cambiar la contraseña',
        });
      });
    const spyTransporterEmail = jest.spyOn(transporter, 'sendMail');
    await expect(authService.resetPassword(email)).rejects.toThrowError(
      new InternalServerErrorException('Hubo un error al enviar el correo de reseteo'),
    );
    expect(spyTransporterEmail).not.toBeCalled();
    expect(spySaveNewPassword).toBeCalled();

    spyTransporterEmail.mockImplementationOnce(async () => {
      throw new InternalServerErrorException('Tranporter Email Error!!!');
    });

    await expect(authService.resetPassword(email)).rejects.toThrowError(
      new InternalServerErrorException('Hubo un error al enviar el correo de reseteo'),
    );
    expect(spySaveNewPassword).toBeCalledTimes(2);
  });

  it('Validate getUserAuthenticatorsById', async () => {
    const spyQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyAddSelect = jest.spyOn(mockService, 'addSelect');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyGetRawOne = jest.spyOn(mockService, 'getRawOne');
    await authService.getUserAuthenticatorsById(email, codUser);

    expect(spyQueryBuilder).toBeCalledWith('AUTH');
    expect(spySelect).toBeCalledWith('AUTH.id', 'id');
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'AUTH.codUser', 'codUser');
    expect(spyAddSelect).toHaveBeenNthCalledWith(2, 'AUTH.credentialID', 'credentialID');
    expect(spyAddSelect).toHaveBeenNthCalledWith(
      3,
      'AUTH.credentialPublicKey',
      'credentialPublicKey',
    );
    expect(spyAddSelect).toHaveBeenNthCalledWith(4, 'AUTH.counter', 'counter');
    expect(spyInnerJoin).toBeCalledWith(User, 'USER', 'USER.id  = AUTH.codUser');
    expect(spyWhere).toBeCalledWith('USER.username  = :username and AUTH.id =:id', {
      username: email,
      id: codUser,
    });
    expect(spyGetRawOne).toBeCalled();
  });

  it('Validate getUserAuthenticatorsByUsername', async () => {
    const spyQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyAddSelect = jest.spyOn(mockService, 'addSelect');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyGetRawMany = jest.spyOn(mockService, 'getRawMany');
    await authService.getUserAuthenticatorsByUsername(email);

    expect(spyQueryBuilder).toBeCalledWith('AUTH');
    expect(spySelect).toBeCalledWith('AUTH.id', 'id');
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'AUTH.codUser', 'codUser');
    expect(spyAddSelect).toHaveBeenNthCalledWith(2, 'AUTH.credentialID', 'credentialID');
    expect(spyAddSelect).toHaveBeenNthCalledWith(
      3,
      'AUTH.credentialPublicKey',
      'credentialPublicKey',
    );
    expect(spyAddSelect).toHaveBeenNthCalledWith(4, 'AUTH.counter', 'counter');
    expect(spyInnerJoin).toBeCalledWith(User, 'USER', 'USER.id  = AUTH.codUser');
    expect(spyWhere).toBeCalledWith('USER.username  = :username', {
      username: email,
    });
    expect(spyGetRawMany).toBeCalled();
  });

  it('Validate saveUserAuthenticators', async () => {
    const spyCreate = jest.spyOn(mockService, 'create').mockImplementationOnce(() => {
      return Authentication;
    });
    const spySave = jest.spyOn(mockService, 'save');
    await authService.saveUserAuthenticators(
      UserServiceMock.userMock,
      codUser,
      AuthMockService.dataWebAuthn,
    );
    expect(spyCreate).toBeCalled();
    expect(spySave).toBeCalledWith(Authentication);
  });

  it('Validate registerCurrentChallenge Ok', async () => {
    const spyUpsert = jest.spyOn(mockService, 'upsert');
    await authService.registerCurrentChallenge(UserServiceMock.userMock, currentChallenge);
    expect(spyUpsert).toBeCalledWith(
      {
        currentChallenge,
        username: UserServiceMock.userMock.username,
        codUser: UserServiceMock.userMock.id,
      },
      { conflictPaths: ['username'] },
    );
  });

  it('Validate registerCurrentChallenge Error', async () => {
    const spyUpsertError = jest.spyOn(mockService, 'upsert').mockRejectedValueOnce(new Error());
    await expect(
      authService.registerCurrentChallenge(UserServiceMock.userMock, currentChallenge),
    ).rejects.toThrowError(
      new InternalServerErrorException('Sucedio un error al registrar challenge user'),
    );
    expect(spyUpsertError).toBeCalled();
  });

  it('Validate getCurrentChallenge Ok', async () => {
    const spyFindOneOrFail = jest.spyOn(mockService, 'findOneOrFail');
    await authService.getCurrentChallenge(UserServiceMock.userMock.username);
    expect(spyFindOneOrFail).toBeCalledWith({
      where: { username: UserServiceMock.userMock.username },
    });
  });

  it('Validate registerCurrentChallenge Error', async () => {
    const spyFindOneOrFail = jest
      .spyOn(mockService, 'findOneOrFail')
      .mockRejectedValueOnce(new Error());
    await expect(
      authService.getCurrentChallenge(UserServiceMock.userMock.username),
    ).rejects.toThrowError(
      new InternalServerErrorException('Sucedio un error al obtener challenge user'),
    );
    expect(spyFindOneOrFail).toBeCalled();
  });
});
