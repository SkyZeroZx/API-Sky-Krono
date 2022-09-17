import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../../src/app.module';
import { AuthModule } from '../../../src/auth/auth.module';
import { Constant } from '../../../src/common/constants/Constant';
import { TaskModule } from '../../../src/task/task.module';
import { UserService } from '../../../src/user/user.service';
import { AuthMockServiceE2E } from '../auth.mock.e2e.spec';
import * as config from '../../config-e2e.json';

describe('Guard Strategy (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request;
  let authMockServiceE2E: AuthMockServiceE2E = new AuthMockServiceE2E();
  let userServiceMock: UserService;
  const {
    jwtToken,
    users: { userLoginOk },
  } = config.env;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TaskModule, AuthModule],
      providers: [
        {
          provide: UserService,
          useValue: authMockServiceE2E,
        },
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    // Configuramos nuestro superTest con la ruta base y nuestro token para peticiones
    userServiceMock = moduleFixture.get<UserService>(UserService);
    request = superTest.agent(app.getHttpServer());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Al finalizar todos nuevos test cerramos las conexiones para evitar memory leaks
  afterAll(async () => {
    await app.close();
  });
  it('VALIDAMOS JWT STRATEGY', async () => {
    // Hacemos nuestra peticion a nuestro servicio y esperamos respondan un status 201
    const userHabilitadoResponse = await request.post('/auth/login').send(userLoginOk).expect(201);
    // Recuperamos el body de nuestro response y desesctructuramos
    const { message, token, ...recivedtUserHabilitado } = userHabilitadoResponse.body;
    // Igualmente con nuestra variables globares
    const { password, ...expectUserHabilitado } = userLoginOk;
    // Validamos la respuesta de nuestro servicio contra los datos de la variables
    expect(message).toEqual(Constant.MENSAJE_OK);
    expect(token).toBeDefined();
    expect(recivedtUserHabilitado).toEqual(expectUserHabilitado);
    const spyGetUserById = jest
      .spyOn(userServiceMock, 'getUserById')
      .mockImplementation(async () => {
        return AuthMockServiceE2E.userBloq;
      });

    const dataStrategy = await request.get('/type').set(jwtToken);

    expect(dataStrategy.body.message).toEqual(
      'Su usuario no se encuentra autorizado , tiene un status BLOQUEADO',
    );
    expect(spyGetUserById).toBeCalled();
  });
});
