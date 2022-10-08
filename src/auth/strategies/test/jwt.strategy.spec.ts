import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { Constants } from '../../../common/constants/Constant';

import { UserService } from '../../../user/user.service';
import { AuthMockService } from '../../auth.mock.spec';
import { JwtStrategy } from '../jwt.stragegy';

describe('JWT Strategy ', () => {
  let jwtStrategy: JwtStrategy;
  let userService: UserService;
  let mockService: AuthMockService = new AuthMockService();
  let config: ConfigService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule, PassportModule],
      providers: [
        JwtStrategy,
        {
          provide: UserService,
          useValue: mockService,
        },
        {
          provide: ConfigService,
          useValue: mockService,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get<UserService>(UserService);
    config = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('Validamos validate', async () => {
    // Validamos el primer caso cuando es un usuario creado
    const payloadMock = {
      userId: 1,
    };
    const spyFindById = jest.spyOn(userService, 'getUserById').mockImplementation(async () => {
      return AuthMockService.userCreate;
    });
    const userCreateValite = await jwtStrategy.validate(payloadMock);
    expect(spyFindById).toBeCalledWith(payloadMock.userId);
    expect(userCreateValite).toEqual(AuthMockService.userCreate);

    // Validamos para el caso cuando es un usuario habilitado
    spyFindById.mockImplementation(async () => {
      return AuthMockService.userHabilitado;
    });
    const userHabilitadoValite = await jwtStrategy.validate(payloadMock);
    expect(spyFindById).toHaveBeenNthCalledWith(2, payloadMock.userId);
    expect(userHabilitadoValite).toEqual(AuthMockService.userHabilitado);

    //Validamos para el caso de un usuario reseteado
    spyFindById.mockImplementation(async () => {
      return AuthMockService.userReset;
    });
    const userReseteadoValite = await jwtStrategy.validate(payloadMock);
    expect(spyFindById).toHaveBeenNthCalledWith(3, payloadMock.userId);
    expect(userReseteadoValite).toEqual(AuthMockService.userReset);

    // Validamos para el caso de un usuario bloqueado , el cual lanza una exception UnauthorizedException
    spyFindById.mockImplementation(async () => {
      return AuthMockService.userBloq;
    });
    await expect(jwtStrategy.validate(payloadMock)).rejects.toThrowError(
      new UnauthorizedException({
        message: `Su usuario no se encuentra autorizado , tiene un status ${Constants.STATUS_USER.BLOQUEADO}`,
      }),
    );

    expect(spyFindById).toHaveBeenNthCalledWith(4, payloadMock.userId);
  });
});
