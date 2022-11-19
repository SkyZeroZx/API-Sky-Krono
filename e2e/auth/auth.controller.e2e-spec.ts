import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../src/app.module';
import { AuthModule } from '../../src/auth/auth.module';
import { e2e_config } from '../e2e-config.spec';
import { Constants } from '../../src/common/constants/Constant';
import { AuthMockServiceE2E } from './auth.mock.e2e.spec';
import { UserService } from '../../src/user/user.service';
import { AuthService } from '../../src/auth/auth.service';
import * as webAuthn from '../../src/config/webAuthentication/webAuthn';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Authentication } from '../../src/auth/entities/autentication.entity';
import { User } from '../../src/user/entities/user.entity';
import bycrpt from 'bcryptjs';
import { Challenge } from '../../src/auth/entities/challenge.entity';
describe('AuthController (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request;
  let authMockServiceE2E: AuthMockServiceE2E = new AuthMockServiceE2E();
  let authenticationServiceMock: AuthMockServiceE2E = new AuthMockServiceE2E();
  let userServiceMock: UserService;
  let authServiceMock: AuthService;
  let challengeRepositoryMock: any;
  let userRepositoryMock: any;
  let mockQueryBuilder: any = {
    update: {
      set: {
        where: {
          execute: jest.fn().mockImplementationOnce(async () => {
            return { affected: 0 };
          }),
        },
      },
    },
  };

  const {
    jwtToken,
    users: { userLoginOk, userReset, userCreate, userBloq },
  } = e2e_config.env;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
      providers: [
        { provide: getRepositoryToken(User), useValue: userRepositoryMock },
        { provide: getRepositoryToken(Challenge), useValue: challengeRepositoryMock },
        {
          provide: UserService,
          useValue: authMockServiceE2E,
        },
      ],
    })
      .overrideProvider(getRepositoryToken(Authentication))
      .useValue(authenticationServiceMock)
      .compile();
    app = moduleFixture.createNestApplication();
    // Inicializamos nuestro validator de los DTO/Entities para validar las excepciones
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    ),
      await app.init();
    userRepositoryMock = moduleFixture.get(getRepositoryToken(User));
    challengeRepositoryMock = moduleFixture.get(getRepositoryToken(Challenge));
    userServiceMock = moduleFixture.get<UserService>(UserService);
    authServiceMock = moduleFixture.get<AuthService>(AuthService);
    request = superTest.agent(app.getHttpServer());
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  // Al finalizar todos nuevos test cerramos las conexiones para evitar memory leaks
  afterAll(async () => {
    await app.close();
  });

  it('/LOGIN (POST) USER HABILITADO', async () => {
    // Hacemos nuestra peticion a nuestro servicio y esperamos respondan un status 201
    const userHabilitadoResponse = await request.post('/auth/login').send(userLoginOk).expect(201);
    // Recuperamos el body de nuestro response y desesctructuramos
    const {
      message,
      token,
      updateAt: updateResponse,
      ...recivedtUserHabilitado
    } = userHabilitadoResponse.body;
    // Igualmente con nuestra variables globares
    const { password, updateAt, ...expectUserHabilitado } = userLoginOk;
    // Validamos la respuesta de nuestro servicio contra los datos de la variables
    expect(token).toBeDefined();
    expect(recivedtUserHabilitado).toEqual(expectUserHabilitado);
  });

  it('/LOGIN (POST) USER RESETEADO', async () => {
    // Hacemos nuestra peticion a nuestro servicio y esperamos respondan un status 201
    const { body } = await request.post('/auth/login').send(userReset).expect(201);
    // Recuperamos el body de nuestro response y desesctructuramos
    const { message, token, ...recivedUserReset } = body;
    // Igualmente con nuestra variables globares
    const { password, ...expectedUserReset } = userReset;
    expect(token).toBeDefined();
    expect(recivedUserReset).toEqual(expectedUserReset);
  });

  it('/LOGIN (POST) USER create', async () => {
    // Hacemos nuestra peticion a nuestro servicio y esperamos respondan un status 201
    const { body } = await request.post('/auth/login').send(userCreate).expect(201);
    // Recuperamos el body de nuestro response y desesctructuramos
    const { message, token, ...recivedUserCreate } = body;
    // Igualmente con nuestra variables globares
    const { password, ...expectedUserCreate } = userCreate;
    // Validamos la respuesta de nuestro servicio contra los datos de la variables
    expect(token).toBeDefined();
    expect(recivedUserCreate).toEqual(expectedUserCreate);
  });

  it('/LOGIN (POST) USER BLOQ', async () => {
    // Hacemos nuestra peticion a nuestro servicio y esperamos respondan un status 401
    await request.post('/auth/login').send(userBloq).expect(401);
  });

  it('/LOGIN (POST) USER ERROR', async () => {
    // Hacemos nuestra peticion a nuestro servicio y esperamos respondan un status 401
    return await request
      .post('/auth/login')
      .send({ username: 'Error@mail.com', password: '655423211265' })
      .expect(401);
  });

  it('/LOGIN (POST) USER INCORRECTO', async () => {
    // Hacemos nuestra peticion a nuestro servicio y esperamos respondan un status 401
    return await request
      .post('/auth/login')
      .send({ username: 'saivergx@gmail.com', password: '655423211265' })
      .expect(401);
  });

  it('/CHANGE-PASSWORD (POST) OK (MOCK)', async () => {
    const spyMockOkAuthSaveNewPassword = jest
      .spyOn(userServiceMock, 'saveNewPassword')
      .mockImplementationOnce(async () => {
        return { message: Constants.MSG_OK, info: 'Todo salio bien soy fake' };
      });

    const changePassswordOK = await request
      .post('/auth/change-password')
      .set(jwtToken)
      .send({ newPassword: 'AdminNewPass@12', oldPassword: userLoginOk.password })
      .expect(201);
    expect(changePassswordOK.body.message).toEqual(Constants.MSG_OK);
    expect(spyMockOkAuthSaveNewPassword).toBeCalled();
  });

  it('/CHANGE-PASSWORD (POST) OK  AFFECTED (MOCK)', async () => {
    // Mockeamos el caso que no hubiera registros afectados
    const spyFindByEmailOk = jest
      .spyOn(userServiceMock, 'findUserByEmail')
      .mockImplementationOnce(async () => {
        return { message: '', user: AuthMockServiceE2E.userHabilitado };
      });
    let mock = new AuthMockServiceE2E();
    const spyCreateQueryBuilderError = jest
      .spyOn(userRepositoryMock, 'createQueryBuilder')
      .mockImplementationOnce(mock.createQueryBuilder);
    const spyExecute = jest.spyOn(mock, 'execute').mockImplementationOnce(async () => {
      return { affected: 1 };
    });
    const spyBycrptCompareOk = jest.spyOn(bycrpt, 'compare').mockImplementation(async () => {
      return true;
    });
    const changePassswordExecuteOK = await request
      .post('/auth/change-password')
      .set(jwtToken)
      .send({ newPassword: 'AdminNewPass@12', oldPassword: userLoginOk.password });
    expect(spyBycrptCompareOk).toBeCalled();
    expect(spyExecute).toBeCalled();
    expect(spyFindByEmailOk).toBeCalled();
    expect(spyCreateQueryBuilderError).toBeCalled();
    expect(changePassswordExecuteOK.body.message).toEqual(Constants.MSG_OK);
  });

  it('/CHANGE-PASSWORD (POST) ERROR (MOCK)', async () => {
    // Mockeamos el caso de error inesperado de base de datos
    const spyFindByEmailOk = jest
      .spyOn(userServiceMock, 'findUserByEmail')
      .mockImplementationOnce(async () => {
        return { message: '', user: AuthMockServiceE2E.userHabilitado };
      });
    const spyCreateQueryBuilderError = jest
      .spyOn(userRepositoryMock, 'createQueryBuilder')
      .mockImplementation(mockQueryBuilder);
    const spyBycrptCompareOk = jest.spyOn(bycrpt, 'compare').mockImplementationOnce(async () => {
      return true;
    });
    const changePassswordExecuteError = await request
      .post('/auth/change-password')
      .set(jwtToken)
      .send({ newPassword: 'AdminNewPass@12', oldPassword: userLoginOk.password });
    expect(changePassswordExecuteError.body.message).toEqual(
      'Sucedio un error al cambiar la contraseña',
    );
    expect(spyFindByEmailOk).toBeCalled();
    expect(spyBycrptCompareOk).toBeCalled();
    expect(spyCreateQueryBuilderError).toBeCalled();
  });

  it('/CHANGE-PASSWORD (POST) ERROR PASSWORD SAME OR NOT MATCH [MOCK]', async () => {
    const spyBycrptCompareOk = jest.spyOn(bycrpt, 'compare').mockImplementationOnce(async () => {
      return false;
    });
    const changePassswordNotMatch = await request
      .post('/auth/change-password')
      .set(jwtToken)
      .send({ newPassword: 'AdminNewPass@12', oldPassword: userLoginOk.password })
      .expect(500);
    expect(changePassswordNotMatch.body.message).toEqual(
      'Hubo un error al cambiar la contraseña , validar',
    );
    expect(spyBycrptCompareOk).toBeCalled();
    const changePassswordExecuteSame = await request
      .post('/auth/change-password')
      .set(jwtToken)
      .send({ newPassword: userLoginOk.password, oldPassword: userLoginOk.password })
      .expect(400);
    expect(changePassswordExecuteSame.body.message).toEqual(
      'No puede repetir la contraseña antigua para la nueva contraseña',
    );
  });

  it('/CHANGE-PASSWORD (POST) ERROR NOT AFFECTED (MOCK)', async () => {
    // Mockeamos el caso que no hubiera registros afectados
    const spyFindByEmailOk = jest
      .spyOn(userServiceMock, 'findUserByEmail')
      .mockImplementationOnce(async () => {
        return { message: '', user: AuthMockServiceE2E.userHabilitado };
      });
    let mock = new AuthMockServiceE2E();
    const spyCreateQueryBuilderError = jest
      .spyOn(userRepositoryMock, 'createQueryBuilder')
      .mockImplementationOnce(mock.createQueryBuilder);
    const spyExecute = jest.spyOn(mock, 'execute').mockImplementationOnce(async () => {
      return { affected: 0 };
    });
    const spyBycrptCompareOk = jest.spyOn(bycrpt, 'compare').mockImplementation(async () => {
      return true;
    });
    const changePassswordExecuteError = await request
      .post('/auth/change-password')
      .set(jwtToken)
      .send({ newPassword: 'AdminNewPass@12', oldPassword: userLoginOk.password });
    expect(spyBycrptCompareOk).toBeCalled();
    expect(spyExecute).toBeCalled();
    expect(spyFindByEmailOk).toBeCalled();
    expect(spyCreateQueryBuilderError).toBeCalled();
    expect(changePassswordExecuteError.body.message).toEqual(
      'Sucedio un error al cambiar la contraseña',
    );
  });

  it('/RESET-PASSWORD (POST) OK  (MOCK)', async () => {
    // Mockeamos el valor de nuestro userService para evitar el reseteo de contraseña
    const spyMockOkAuthSaveNewPassword = jest
      .spyOn(userServiceMock, 'saveNewPassword')
      .mockImplementation(async () => {
        return { message: Constants.MSG_OK, info: 'Todo salio bien soy fake' };
      });
    const userReseteadoOk = await request
      .post('/auth/reset-password')
      .set(jwtToken)
      .send({ username: userCreate.username, password: 'CUALQUIER_COSA' });
    expect(userReseteadoOk.body.message).toEqual(Constants.MSG_OK);
    expect(spyMockOkAuthSaveNewPassword).toBeCalled();
  });

  it('/RESET-PASSWORD (POST) Error [USER SERVICE - REJECT]  (MOCK)', async () => {
    // Mockeamos el valor de nuestro userService para evitar el reseteo de contraseña
    const spyMockErrorAuthSaveNewPassword = jest
      .spyOn(userServiceMock, 'saveNewPassword')
      .mockRejectedValue(new Error('Sucedio un error inesperado'));
    const userReseteadoOk = await request
      .post('/auth/reset-password')
      .set(jwtToken)
      .send({ username: userCreate.username, password: 'CUALQUIER_COSA' })
      .expect(500);
    expect(userReseteadoOk.body.message).toEqual('Hubo un error al enviar el correo de reseteo');
    expect(spyMockErrorAuthSaveNewPassword).toBeCalled();
  });

  it('/RESET-PASSWORD (POST) Error [USER SERVICE - RESOLVE ]  (MOCK)', async () => {
    // Mockeamos el valor de nuestro userService para evitar el reseteo de contraseña
    const spyMockErrorAuthSaveNewPassword = jest
      .spyOn(userServiceMock, 'saveNewPassword')
      .mockRejectedValueOnce({ message: 'Error controlado ', info: 'Algo salio mal fake' });
    const userReseteadoOk = await request
      .post('/auth/reset-password')
      .set(jwtToken)
      .send({ username: userCreate.username, password: 'CUALQUIER_COSA' })
      .expect(500);
    expect(userReseteadoOk.body.message).toEqual('Hubo un error al enviar el correo de reseteo');
    expect(spyMockErrorAuthSaveNewPassword).toBeCalled();
  });

  it('/AUTH/GENERATE-REGISTRATION-OPTIONS (GET) - OK', async () => {
    const spyWebAuthn = jest
      .spyOn(webAuthn, 'generateRegistrationOption')
      .mockReturnValue(AuthMockServiceE2E.generateRegistrationOption);
    const spyGegisterCurrentChallenge = jest
      .spyOn(challengeRepositoryMock, 'upsert')
      .mockReturnValueOnce(null);
    const userGenerateRegistrationOptions = await request
      .get('/auth/generate-registration-options')
      .set(jwtToken);
    expect(spyWebAuthn).toBeCalled();
    expect(spyGegisterCurrentChallenge).toBeCalled();
    expect(userGenerateRegistrationOptions.body).toEqual(
      AuthMockServiceE2E.generateRegistrationOption,
    );
  });

  it('/AUTH/GENERATE-REGISTRATION-OPTIONS (GET) - ERROR REGISTER CURRENT CHALLENGE', async () => {
    const spyWebAuthn = jest
      .spyOn(webAuthn, 'generateRegistrationOption')
      .mockReturnValue(AuthMockServiceE2E.generateRegistrationOption);
    const spyGegisterCurrentChallengeError = jest
      .spyOn(challengeRepositoryMock, 'upsert')
      .mockRejectedValueOnce(new Error());
    const userGenerateRegistrationOptions = await request
      .get('/auth/generate-registration-options')
      .set(jwtToken);
    expect(spyWebAuthn).toBeCalled();
    expect(spyGegisterCurrentChallengeError).toBeCalled();
    expect(userGenerateRegistrationOptions.body).not.toEqual(
      AuthMockServiceE2E.generateRegistrationOption,
    );
  });

  it('/AUTH/VERIFY-REGISTRATION (POST) OK (MOCK)', async () => {
    const spySave = jest.spyOn(authenticationServiceMock, 'save').mockImplementation(async () => {
      return { message: Constants.MSG_OK };
    });
    const spyVerifyAuthWeb = jest
      .spyOn(webAuthn, 'verifyAuthWeb')
      .mockResolvedValue(AuthMockServiceE2E.verifyAuthWeb);
    const userGenerateRegistrationOptions = await request
      .post('/auth/verify-registration')
      .set(jwtToken)
      .send({ id: 666 });
    expect(userGenerateRegistrationOptions.body.message).toEqual(Constants.MSG_OK);
    // Validamos se llamen nuestro mockeos de nuestras funciones
    expect(spyVerifyAuthWeb).toBeCalled();
    expect(spySave).toBeCalled();
  });

  it('/AUTH/VERIFY-REGISTRATION (POST) - ERROR GET CURRENT CHALLENGE', async () => {
    const spyGetCurrentChallengeError = jest
      .spyOn(challengeRepositoryMock, 'findOneOrFail')
      .mockRejectedValueOnce(new Error());
    const userGenerateRegistrationOptions = await request
      .post('/auth/verify-registration')
      .set(jwtToken)
      .send({ id: 666 })
      .expect(500);
    expect(userGenerateRegistrationOptions.body.message).not.toEqual(Constants.MSG_OK);
    expect(spyGetCurrentChallengeError).toBeCalled();
  });

  it('/AUTH/GENERATE-AUTHENTICATION-OPTIONS (POST) OK (MOCK)', async () => {
    const spyGenerateAuthenticationOptionWebAuthn = jest
      .spyOn(webAuthn, 'generateAuthenticationOption')
      .mockResolvedValue({
        challenge: null,
        allowCredentials: [],
      });
    const spyRegisterCurrentChallenge = jest
      .spyOn(challengeRepositoryMock, 'upsert')
      .mockResolvedValueOnce(null);
    /*  const spyRegisterCurrentChallenge = jest
      .spyOn(authServiceMock, 'registerCurrentChallenge')
      .mockResolvedValue(null);*/
    await request
      .post('/auth/generate-authentication-options')
      .set(jwtToken)
      .send({ username: userLoginOk.username });
    // Validamos se llamen nuestro mockeos de nuestras funciones
    expect(spyGenerateAuthenticationOptionWebAuthn).toBeCalled();
    //  expect(spyRegisterCurrentChallenge).toBeCalled();
  });

  it('/AUTH/VERIFY-AUTHENTICATION (POST) OK (MOCK)', async () => {
    const spyVerifyAuthenticationOption = jest
      .spyOn(webAuthn, 'verifyAuthenticationOption')
      .mockImplementation(async () => {
        return AuthMockServiceE2E.verifityAuthenticationOption;
      });
    const userVerifiyAuthentication = await request
      .post('/auth/verify-authentication')
      .set(jwtToken)
      .send({ username: userLoginOk.username, id: 1 });
    const { createdAt, updateAt, ...resExpect } = userVerifiyAuthentication.body.data;
    const {
      createdAt: createAtCompare,
      updateAt: updateAtCompare,
      ...resCompare
    } = AuthMockServiceE2E.verifityAuthenticationOption['data'];
    expect(userVerifiyAuthentication.body.authenticationInfo).toEqual(
      AuthMockServiceE2E.verifityAuthenticationOption.authenticationInfo,
    );
    expect(resExpect).toEqual(resCompare);
    expect(spyVerifyAuthenticationOption).toBeCalled();
  });

  it('/CHANGE-PASSWORD (POST) ERROR VALIDATORS BAD REQUEST ', async () => {
    const oldPasswordIsNotEmpty = await request
      .post('/auth/change-password')
      .set(jwtToken)
      .send({ newPassword: '', oldPassword: userLoginOk.password })
      .expect(400);

    expect(oldPasswordIsNotEmpty.body.message).toContain('newPassword should not be empty');

    const newPasswordIsNotEmpty = await request
      .post('/auth/change-password')
      .set(jwtToken)
      .send({ newPassword: 'sdfsdfsdfsdfsd', oldPassword: '' })
      .expect(400);

    expect(newPasswordIsNotEmpty.body.message).toContain('oldPassword should not be empty');
  });
});
