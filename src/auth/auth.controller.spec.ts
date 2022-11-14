import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constants } from '../common/constants/Constant';
import { UserServiceMock } from '../user/user.mock.spec';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthMockService } from './auth.mock.spec';
import { AuthService } from './auth.service';
import { Authentication } from './entities/autentication.entity';
import * as webAuthn from '../config/webAuthentication/webAuthn';
import { ChangePasswordDto } from './dtos/changePasssword.dto';
import { BadRequestException } from '@nestjs/common';
import { Challenge } from './entities/challenge.entity';
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
    const spyGenerateToken = jest.spyOn(authService, 'generateToken').mockImplementation(() => {
      return { ...UserServiceMock.mockFindAllUserData[0], token: AuthMockService.token };
    });
    await controller.login(AuthMockService.loginDto, AuthMockService.userResetado);
    expect(spyGenerateToken).toBeCalledWith(AuthMockService.userResetado);
  });

  it('Validamos generateRegistration', async () => {
    const mockReturn: any = { register: { challenge: null } };
    const spyRegisterCurrentChallenge = jest
      .spyOn(authService, 'registerCurrentChallenge')
      .mockResolvedValueOnce(null);
    const spyGenerateRegistrationOption = jest
      .spyOn(webAuthn, 'generateRegistrationOption')
      .mockReturnValueOnce(mockReturn);
    const spyGenerateToken = jest
      .spyOn(authService, 'getUserAuthenticatorsByUsername')
      .mockImplementation(async () => {
        return [];
      });
    await controller.generateRegistration(UserServiceMock.mockFindAllUserData[0]);
    expect(spyGenerateRegistrationOption).toBeCalled();
    expect(spyGenerateToken).toBeCalled();
    expect(spyRegisterCurrentChallenge).toBeCalled();
  });

  it('Validamos verifyRegistration', async () => {
    const verifyMock = {
      id: 1,
    };
    const spyGetCurrentChallenge = jest
      .spyOn(authService, 'getCurrentChallenge')
      .mockResolvedValueOnce(AuthMockService.challenge);
    const spyVerifyAuthWeb = jest.spyOn(webAuthn, 'verifyAuthWeb').mockResolvedValueOnce(null);
    const spySaveUserAuthenticators = jest
      .spyOn(authService, 'saveUserAuthenticators')
      .mockResolvedValue(null);
    await controller.verifyRegistration(verifyMock, user);
    expect(spyVerifyAuthWeb).toBeCalled();
    expect(spySaveUserAuthenticators).toBeCalled();
    expect(spyGetCurrentChallenge).toBeCalled();
  });

  it('Validamos generateAuthenticationOptions', async () => {
    const spyGetUserAuthenticatorsByUsername = jest
      .spyOn(authService, 'getUserAuthenticatorsByUsername')
      .mockResolvedValueOnce([]);
    const spyGenerateAuthenticationOption = jest
      .spyOn(webAuthn, 'generateAuthenticationOption')
      .mockResolvedValueOnce({ challenge: '' });
    const spyRegisterCurrentChallenge = jest
      .spyOn(authService, 'registerCurrentChallenge')
      .mockResolvedValueOnce(null);
    await controller.generateAuthenticationOptions(user);
    expect(spyGetUserAuthenticatorsByUsername).toBeCalled();
    expect(spyGenerateAuthenticationOption).toBeCalled();
    expect(spyRegisterCurrentChallenge).toBeCalled();
  });

  it('Validamos verifityAuthentication', async () => {
    const spyGetCurrentChallenge = jest
      .spyOn(authService, 'getCurrentChallenge')
      .mockResolvedValueOnce(AuthMockService.challenge);
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
    expect(spyGetCurrentChallenge).toBeCalled();
  });

  it('Validamos resetPassword', async () => {
    const spyResetPassword = jest.spyOn(authService, 'resetPassword').mockResolvedValueOnce(null);
    await controller.resetPassword(AuthMockService.resetUserDto);
    expect(spyResetPassword).toHaveBeenCalledWith(AuthMockService.resetUserDto.username);
  });

  it('Validamos changePassword', async () => {
    const spyChangePassword = jest.spyOn(authService, 'changePassword').mockResolvedValueOnce(null);
    await controller.changePassword(user, AuthMockService.changePasswordDto);
    expect(spyChangePassword).toBeCalledWith(user, AuthMockService.changePasswordDto);
  });
});
