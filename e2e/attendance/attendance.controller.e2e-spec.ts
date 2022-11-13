import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { e2e_config } from '../e2e-config.spec';
import { Util } from '../../src/common/utils/util';
import { Constants } from '../../src/common/constants/Constant';
import { AttendanceModule } from '../../src/attendance/attendance.module';
import { Attendance } from '../../src/attendance/entities/attendance.entity';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { ScheduleService } from '../../src/schedule/schedule.service';
import { AttendanceE2EMock } from './attendance.mock.spec';
import { Schedule } from '../../src/schedule/entities/schedule.entity';
import { AttendanceServiceMock } from '../../src/attendance/attendance.mock.spec';

describe('AttendanceController (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request: any;
  let attendanceRepositoryMock: any;
  let scheduleRepositoryMock: any;
  let scheduleServiceMock: ScheduleService;
  let schedulerRegistryMock: any;
  const {
    jwtToken,
    users: {
      userLoginOk: { id: userId },
    },
  } = e2e_config.env;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AttendanceModule],
      providers: [
        { provide: getRepositoryToken(Attendance), useValue: attendanceRepositoryMock },
        { provide: getRepositoryToken(Schedule), useValue: scheduleRepositoryMock },
        { provide: ScheduleService, useValue: scheduleServiceMock },
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
    attendanceRepositoryMock = moduleFixture.get(getRepositoryToken(Attendance));
    scheduleRepositoryMock = moduleFixture.get(getRepositoryToken(Schedule));
    scheduleServiceMock = moduleFixture.get<ScheduleService>(ScheduleService);
    schedulerRegistryMock = moduleFixture.get<SchedulerRegistry>(SchedulerRegistry);
    jest.spyOn(scheduleServiceMock, 'onModuleInit').mockImplementation(() => {
      return null;
    });
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

  it('/ATTENDANCE (GET) OK ', async () => {
    await request.get('/attendance').expect(200);
  });

  it('/ATTENDANCE (GET) ERROR [MOCK]', async () => {
    const spyFindOneBy = jest
      .spyOn(attendanceRepositoryMock, 'findOneBy')
      .mockRejectedValueOnce(new Error());
    await request.get('/attendance').expect(500);
    expect(spyFindOneBy).toBeCalled();
  });

  it('/ATTENDANCE (POST) ERROR [MOCK] - OUT SCHEDULE USER ', async () => {
    const spyValidateRegisterDate = jest
      .spyOn(Util, 'validateRegisterDate')
      .mockReturnValueOnce(false);
    await request.post('/attendance').send(AttendanceE2EMock.createAttendanceDto).expect(400);
    expect(spyValidateRegisterDate).toBeCalled();
  });

  it('/ATTENDANCE (POST) ERROR [MOCK] - ERROR SAVE ATTENDANCE ', async () => {
    const spyValidateRegisterDate = jest
      .spyOn(Util, 'validateRegisterDate')
      .mockReturnValueOnce(true);
    const spySaveError = jest
      .spyOn(attendanceRepositoryMock, 'save')
      .mockRejectedValueOnce(new Error());
    await request.post('/attendance').send(AttendanceE2EMock.createAttendanceDto).expect(500);
    expect(spyValidateRegisterDate).toBeCalled();
    expect(spySaveError).toBeCalled();
  });

  it('/ATTENDANCE (POST) OK [MOCK] ', async () => {
    const spyValidateRegisterDate = jest
      .spyOn(Util, 'validateRegisterDate')
      .mockReturnValueOnce(true);
    const spySaveError = jest.spyOn(attendanceRepositoryMock, 'save').mockResolvedValueOnce(null);
    const {
      body: { message },
    } = await request.post('/attendance').send(AttendanceE2EMock.createAttendanceDto).expect(201);
    expect(spyValidateRegisterDate).toBeCalled();
    expect(spySaveError).toBeCalled();
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/ATTENDANCE (PATCH) OK [MOCK] ', async () => {
    const spyFindOrFail = jest
      .spyOn(attendanceRepositoryMock, 'findOneOrFail')
      .mockImplementationOnce(async () => {
        return { isActive: true };
      });
    const spyUpdate = jest
      .spyOn(attendanceRepositoryMock, 'update')
      .mockResolvedValueOnce({ affected: 1 });
    const {
      body: { message },
    } = await request.patch('/attendance').expect(200);
    expect(message).toEqual(Constants.MSG_OK);
    expect(spyFindOrFail).toBeCalled();
    expect(spyUpdate).toBeCalled();
  });

  it('/ATTENDANCE (PATCH) ERROR [MOCK]  - NOT ACTIVE ATTENDANCE THROW ERROR DATABASE', async () => {
    const spyFindOrFailError = jest
      .spyOn(attendanceRepositoryMock, 'findOneOrFail')
      .mockImplementationOnce(async () => {
        throw new Error('Database Error');
      });
    await request.patch('/attendance').expect(500);
    expect(spyFindOrFailError).toBeCalled();
  });

  it('/ATTENDANCE (PATCH) ERROR [MOCK] - BAD REQUEST PREVIOUSLY REGISTER ATTENDANCE EXIT', async () => {
    const spyFindOrFailError = jest
      .spyOn(attendanceRepositoryMock, 'findOneOrFail')
      .mockImplementationOnce(async () => {
        return { isActive: false };
      });
    await request.patch('/attendance').expect(400);
    expect(spyFindOrFailError).toBeCalled();
  });

  it('/ATTENDANCE (PATCH) ERROR [MOCK] - UPDATE NOT AFFECTED ', async () => {
    const spyFindOrFail = jest
      .spyOn(attendanceRepositoryMock, 'findOneOrFail')
      .mockImplementationOnce(async () => {
        return { isActive: true };
      });
    jest.spyOn(attendanceRepositoryMock, 'update').mockResolvedValueOnce({ affected: 0 });
    await request.patch('/attendance').expect(500);
    expect(spyFindOrFail).toBeCalled();
  });

  it('/ATTENDANCE/HISTORY (GET) OK ', async () => {
    const {
      body: { currentDate, listHistoryStatusAttendance },
    } = await request.get('/attendance/history').expect(200);
    expect(currentDate).toBeDefined();
    expect(listHistoryStatusAttendance.length).toBeGreaterThanOrEqual(1);
  });

  it('/ATTENDANCE/CHART (POST) OK ', async () => {
    // Query because error connecting mysql database in StoreProcedure
    jest.spyOn(attendanceRepositoryMock, 'query').mockImplementationOnce(async () => {
      return [];
    });
    await request
      .post('/attendance/chart')
      .send(AttendanceE2EMock.reportChartAttendance)
      .expect(201);
  });

  it('/ATTENDANCE/CHART-USER (POST) OK ', async () => {
    // Query because error connecting mysql database in StoreProcedure
    jest.spyOn(attendanceRepositoryMock, 'query').mockImplementation(async () => {
      return [];
    });
    await request
      .post('/attendance/chart-user')
      .send(AttendanceE2EMock.reportChartAttendance)
      .expect(201);
  });

  it('/ATTENDANCE/REPORT (POST) OK ', async () => {
    // Query because error connecting mysql database in StoreProcedure
    jest.spyOn(attendanceRepositoryMock, 'query').mockImplementation(async () => {
      return [];
    });
    await request
      .post('/attendance/report')
      .send(AttendanceE2EMock.reportAttendanceDto)
      .expect(201);
  });
});
