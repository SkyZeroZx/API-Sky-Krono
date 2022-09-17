import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constant } from '../common/constants/Constant';
import { UserServiceMock } from '../user/user.mock.spec';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthMockService } from './auth.mock.spec';
import { AuthService } from './auth.service';
import { Authentication } from './entities/autentication.entity';
import * as webAuthn from '../config/webAuthentication/webAuthn';
import { ChangePasswordDto } from './dtos/changePasssword.dto';
import { BadRequestException } from '@nestjs/common';
describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let mockService: AuthMockService = new AuthMockService();
  const user = UserServiceMock.mockFindAllUserData[0];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Authentication),
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

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Validamos Login', async () => {
    // Validamos el primer caso donde los status reseteado , creado y habilitado pueden logearse
    const spyGenerateToken = jest.spyOn(authService, 'generateToken').mockImplementation(() => {
      return { ...UserServiceMock.mockFindAllUserData[0], token: AuthMockService.token };
    });
    const loginOkReseteado: any = await controller.login(
      AuthMockService.loginDto,
      AuthMockService.userResetado,
    );
    expect(spyGenerateToken).toBeCalledWith(AuthMockService.userResetado);
    expect(loginOkReseteado.message).toEqual(Constant.MENSAJE_OK);
    // Validamos para el caso de usuario HABILITADO

    const loginOkHabilitado: any = await controller.login(
      AuthMockService.loginDto,
      AuthMockService.userHabilitado,
    );
    expect(spyGenerateToken).toHaveBeenNthCalledWith(2, AuthMockService.userHabilitado);
    expect(loginOkHabilitado.message).toEqual(Constant.MENSAJE_OK);

    // Validamos para el caso de usuario CREADO
    const loginOkCreado: any = await controller.login(
      AuthMockService.loginDto,
      AuthMockService.userCreate,
    );
    expect(spyGenerateToken).toHaveBeenNthCalledWith(3, AuthMockService.userCreate);

    expect(loginOkHabilitado.message).toEqual(Constant.MENSAJE_OK);

    // En caso contario cualquier otro usuario como el status bloqueado no puede logearse
    let userBloqueado = AuthMockService.userResetado;
    userBloqueado.status = Constant.STATUS_USER.BLOQUEADO;
    const loginBloqueado: any = await controller.login(AuthMockService.loginDto, userBloqueado);
    expect(spyGenerateToken).not.toBeCalledTimes(4);
    expect(loginBloqueado).toEqual({
      message: `El usuario tiene un status ${userBloqueado.status}`,
    });
  });

  it('Validamos generateRegistration', async () => {
    const spyGenerateRegistrationOption = jest.spyOn(webAuthn, 'generateRegistrationOption');
    const spyGenerateToken = jest
      .spyOn(authService, 'getUserAuthenticators')
      .mockImplementation(async () => {
        return [];
      });
    await controller.generateRegistration(UserServiceMock.mockFindAllUserData[0]);
    expect(spyGenerateRegistrationOption).toBeCalled();
    expect(spyGenerateToken).toBeCalled();
  });

  it('Validamos verifyRegistration', async () => {
    let verifyMock = {
      id: 1,
    };
    const spyVerifyAuthWeb = jest.spyOn(webAuthn, 'verifyAuthWeb').mockResolvedValueOnce(null);
    const spySaveUserAuthenticators = jest
      .spyOn(authService, 'saveUserAuthenticators')
      .mockResolvedValue(null);
    await controller.verifyRegistration(verifyMock, user);
    expect(spyVerifyAuthWeb).toBeCalled();
    expect(spySaveUserAuthenticators).toBeCalled();
  });

  it('Validamos generateAuthenticationOptions', async () => {
    const spyGetUserAuthenticatorsByUsername = jest
      .spyOn(authService, 'getUserAuthenticatorsByUsername')
      .mockResolvedValueOnce([]);
    const spyGenerateAuthenticationOption = jest
      .spyOn(webAuthn, 'generateAuthenticationOption')
      .mockResolvedValueOnce({ challenge: '' });
    await controller.generateAuthenticationOptions(user);
    expect(spyGetUserAuthenticatorsByUsername).toBeCalled();
    expect(spyGenerateAuthenticationOption).toBeCalled();
  });

  it('Validamos verifityAuthentication', async () => {
    const spyGetUserAuthenticatorsById = jest.spyOn(authService, 'getUserAuthenticatorsById');
    const spyGenerateTokenWithAuthnWeb = jest
      .spyOn(authService, 'generateTokenWithAuthnWeb')
      .mockResolvedValueOnce(null);
    const spyVerifyAuthenticationOption = jest
      .spyOn(webAuthn, 'verifyAuthenticationOption')
      .mockResolvedValue(AuthMockService.verifyAuthWeb);
    await controller.verifityAuthentication(user);
    expect(spyVerifyAuthenticationOption).toBeCalled();
    expect(spyGetUserAuthenticatorsById).toBeCalled();
    expect(spyGenerateTokenWithAuthnWeb).toBeCalled();
  });

  it('Validamos resetPassword', async () => {
    const spyResetPassword = jest.spyOn(authService, 'resetPassword').mockResolvedValue(null);
    await controller.resetPassword(AuthMockService.resetUserDto);
    expect(spyResetPassword).toHaveBeenCalledWith(AuthMockService.resetUserDto.username);
  });

  it('Validamos changePassword OK', async () => {
    const { oldPassword, newPassword } = AuthMockService.changePasswordDto;
    let newUserPassword = user;
    newUserPassword.firstLogin = false;
    newUserPassword.status = Constant.STATUS_USER.HABILITADO;
    newUserPassword.password = newPassword;
    const spyChangePassword = jest.spyOn(authService, 'changePassword').mockResolvedValue(null);
    await controller.changePassword(AuthMockService.changePasswordDto, user);
    expect(spyChangePassword).toBeCalledWith(newUserPassword, oldPassword);
  });

  it('Validamos changePassword Error', async () => {
    let userSamePassword: ChangePasswordDto = {
      oldPassword: user.password,
      newPassword: user.password,
    };
    const spyChangePassword = jest.spyOn(authService, 'changePassword');

    await expect(controller.changePassword(userSamePassword, user)).rejects.toThrowError(
      new BadRequestException({
        message: 'No puede repetir la contraseña antigua para la nueva contraseña',
      }),
    );
    expect(spyChangePassword).not.toBeCalled();
  });
});
