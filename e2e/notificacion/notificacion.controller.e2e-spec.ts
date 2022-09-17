import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../src/app.module';
import * as config from '../config-e2e.json';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificacionModule } from '../../src/notificacion/notificacion.module';
import webPush from '../../src/config/webpush';
import { Notificacion } from '../../src/notificacion/entities/notificacion.entity';
import { NotificacionService } from '../../src/notificacion/notificacion.service';
import { Constant } from '../../src/common/constants/Constant';

describe('NotificacionController (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request;
  let notificacionServiceMock: NotificacionService;
  let notificacionRepositoryMock;
  const {
    jwtToken,
    users: { userLoginOk, userReseteado, userCreado, userBloqueado },
  } = config.env;
  const arrayUsers = [userLoginOk, userReseteado, userCreado, userBloqueado];
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, NotificacionModule],
      providers: [
        { provide: NotificacionService, useValue: notificacionServiceMock },
        { provide: getRepositoryToken(Notificacion), useValue: notificacionRepositoryMock },
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    // Inicializamos nuestro validator de los DTO/Entities para validar las excepciones
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    notificacionServiceMock = moduleFixture.get<NotificacionService>(NotificacionService);
    notificacionRepositoryMock = moduleFixture.get(getRepositoryToken(Notificacion));

    // Inc]ializamos las push notification
    webPush();
    // Configuramos nuestro superTest con la ruta base y nuestro token para peticiones
    request = superTest.agent(app.getHttpServer()).set(jwtToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Al finalizar todos nuevos test cerramos las conexiones para evitar memory leaks
  afterAll(async () => {
    await app.close();
  });

  it('/NOTIFICACION (POST) OK [MOCK]', async () => {
    // Mockeamos la respuesta del registro de un token
    const spySaveMock = jest.spyOn(notificacionRepositoryMock, 'save').mockResolvedValueOnce(null);
    const tokenPush = 'Envie un token';
    const sendNotificationOk = await request.post('/notificacion').send({ tokenPush });
    expect(spySaveMock).toBeCalled();
    expect(sendNotificationOk.body.message).toEqual(Constant.MENSAJE_OK);
  });

  it('/NOTIFICACION (POST) ERROR [MOCK]', async () => {
    // Mockeamos la respuesta del registro de un token
    const spySaveMockError = jest
      .spyOn(notificacionRepositoryMock, 'save')
      .mockRejectedValueOnce(new Error('Algo salio mal'));
    const tokenPush = 'Envie un token';
    const sendNotificationError = await request.post('/notificacion').send({ tokenPush });
    expect(spySaveMockError).toBeCalled();
    expect(sendNotificationError.body.message).toEqual('Sucedio un error al guardar el token');
  });

  it('/NOTIFICACION/SEND (POST) OK', async () => {
    const sendNotificationOk = await request.post('/notificacion/send').send({ users: arrayUsers });
    expect(sendNotificationOk.body.message).toEqual(Constant.MENSAJE_OK);
  });

  it('/NOTIFICACION/SEND (POST) ERROR [MOCK]', async () => {
    const spyFindTokensByUser = jest
      .spyOn(notificacionServiceMock, 'findTokensByUser')
      .mockRejectedValue(new Error('Algo salio mal'));
    const sendNotificationError = await request
      .post('/notificacion/send')
      .send({ users: arrayUsers });
    expect(sendNotificationError.body.message).toEqual(
      'Sucedio un error al registrar tokens para la nueva tarea',
    );
    expect(spyFindTokensByUser).toBeCalled();
  });
});
