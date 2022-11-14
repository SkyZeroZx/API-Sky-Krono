import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { e2e_config } from '../e2e-config.spec';
import { Constants } from '../../src/common/constants/Constant';
import { ScheduleE2EMock } from './schedule.mock.spec';
import { Schedule } from '../../src/schedule/entities/schedule.entity';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { NotificationModule } from '../../src/notification/notification.module';
import { NotificationService } from '../../src/notification/notification.service';
import { ScheduleService } from '../../src/schedule/schedule.service';

describe('ScheduleController (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request: any;
  let notificationServiceMock: NotificationService;
  let scheduleRepositoryMock: any;
  let schedulerRegistryMock: any;
  let scheduleServiceMock: ScheduleService;
  const { jwtToken } = e2e_config.env;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ScheduleModule, NotificationModule],
      providers: [
        { provide: getRepositoryToken(Schedule), useValue: scheduleRepositoryMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: SchedulerRegistry, useValue: schedulerRegistryMock },
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    // Inicializamos nuestro validator de los DTO/Entities para validar las excepciones
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    ),
      await app.init();
    scheduleRepositoryMock = moduleFixture.get(getRepositoryToken(Schedule));
    notificationServiceMock = moduleFixture.get<NotificationService>(NotificationService);
    schedulerRegistryMock = moduleFixture.get<SchedulerRegistry>(SchedulerRegistry);
    scheduleServiceMock = moduleFixture.get<ScheduleService>(ScheduleService);
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

  it('/SCHEDULE  (POST) OK', async () => {
    const { createScheduleDto } = new ScheduleE2EMock();
    const {
      body: { message },
    } = await request.post('/schedule').send(createScheduleDto).expect(201);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/SCHEDULE  (POST) OK - SEND NOTIFICATIONS ', async () => {
    const spySendNotificationsMock = jest.spyOn(notificationServiceMock, 'findTokensBySchedule');
    await scheduleServiceMock.sendNotificationBySchedule(
      ScheduleE2EMock.scheduleNotificationEnabled,
    );
    expect(spySendNotificationsMock).toBeCalled();
  });

  it('/SCHEDULE (POST) ERROR [MOCK]', async () => {
    const { createScheduleDto } = new ScheduleE2EMock();
    const spySaveError = jest
      .spyOn(scheduleRepositoryMock, 'save')
      .mockRejectedValueOnce(new Error());
    await request.post('/schedule').send(createScheduleDto).expect(500);
    expect(spySaveError).toBeCalled();
  });

  it('/SCHEDULE (GET) OK', async () => {
    const { body } = await request.get('/schedule').expect(200);
    expect(body.length).toBeGreaterThanOrEqual(0);
  });

  it('/SCHEDULE/USER (GET) OK', async () => {
    const {
      body: { dayIsValid, schedule },
    } = await request.get('/schedule/user').expect(200);
    expect(dayIsValid).toBeDefined();
    expect(schedule).toBeInstanceOf(Object);
    expect(schedule).toBeDefined();
  });

  it('/SCHEDULE (PATCH) OK  - NOTIFICATION NOT ACTIVE', async () => {
    const { updateScheduleDto } = new ScheduleE2EMock();
    const {
      body: { message },
    } = await request.patch('/schedule').send(updateScheduleDto).expect(200);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/SCHEDULE (PATCH) OK - NOTIFICATION IS ACTIVE', async () => {
    const { updateScheduleDtoNotificationActive } = new ScheduleE2EMock();
    const {
      body: { message },
    } = await request.patch('/schedule').send(updateScheduleDtoNotificationActive).expect(200);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/SCHEDULE (PATCH) ERROR [MOCK]', async () => {
    const spyUpdateError = jest
      .spyOn(scheduleRepositoryMock, 'update')
      .mockResolvedValueOnce({ affected: 0 });
    const { updateScheduleDto } = new ScheduleE2EMock();
    await request.patch('/schedule').send(updateScheduleDto).expect(500);
    expect(spyUpdateError).toBeCalled();
  });

  it('/SCHEDULE (DELETE) OK NOTIFICATION ACTIVE', async () => {
    const spyFindOrFail = jest
      .spyOn(scheduleRepositoryMock, 'findOneByOrFail')
      .mockResolvedValueOnce(ScheduleE2EMock.scheduleNotificationEnabled);
    const spySchedulerDelete = jest
      .spyOn(schedulerRegistryMock, 'deleteCronJob')
      .mockResolvedValueOnce(null);
    const {
      body: { message },
    } = await request.delete('/schedule/999').expect(200);

    expect(spyFindOrFail).toBeCalled();
    expect(spySchedulerDelete).toBeCalled();
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/SCHEDULE (DELETE) ERROR [MOCK]', async () => {
    const spyFindOrFail = jest
      .spyOn(scheduleRepositoryMock, 'findOneByOrFail')
      .mockRejectedValueOnce(new Error());
    await request.delete('/schedule/999').expect(500);
    expect(spyFindOrFail).toBeCalled();
  });
});
