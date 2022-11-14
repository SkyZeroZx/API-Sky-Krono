import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Notification } from '../../src/notification/entities/notification.entity'
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constants } from '../../src/common/constants/Constant';
import { NotificationService } from '../../src/notification/notification.service';
import { e2e_config } from '../e2e-config.spec';
import { NotificationModule } from '../../src/notification/notification.module';
import webPush from '../../src/config/webpush/webpush'


describe('NotificacionController (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request : any;
  let notificationServiceMock: NotificationService;
  let notificacionRepositoryMock : any;
  const {
    jwtToken,
    users: { userLoginOk, userReset, userCreate, userBloq },
  } = e2e_config.env;
  const arrayUsers = [userLoginOk, userReset, userCreate, userBloq];
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, NotificationModule],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: getRepositoryToken(Notification), useValue: notificacionRepositoryMock },
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
    notificationServiceMock = moduleFixture.get<NotificationService>(NotificationService);
    notificacionRepositoryMock = moduleFixture.get(getRepositoryToken(Notification));

    // Inc]ializamos las push notification
    webPush();
    // Configuramos nuestro superTest con la ruta base y nuestro token para peticiones
    request = superTest.agent(app.getHttpServer()).set(jwtToken);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
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
    expect(sendNotificationOk.body.message).toEqual(Constants.MSG_OK);
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
    expect(sendNotificationOk.body.message).toEqual(Constants.MSG_OK);
  });

  it('/NOTIFICACION/SEND (POST) ERROR [MOCK]', async () => {
    const spyFindTokensByUser = jest
      .spyOn(notificationServiceMock, 'findTokensByUser')
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


