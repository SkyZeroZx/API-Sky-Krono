import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceMock } from '../user/user.mock.spec';
import { AttendanceController } from './attendance.controller';
import { AttendanceServiceMock } from './attendance.mock.spec';
import { AttendanceService } from './attendance.service';

describe('AttendanceController', () => {
  let attendanceController: AttendanceController;
  let attendanceService: AttendanceService;
  let mockService: AttendanceServiceMock = new AttendanceServiceMock();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockService,
        },
      ],
    }).compile();

    attendanceController = module.get<AttendanceController>(AttendanceController);
    attendanceService = module.get<AttendanceService>(AttendanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(attendanceController).toBeDefined();
  });

  it('Validate findOne', async () => {
    const spyFindOne = jest.spyOn(attendanceService, 'findOne');
    attendanceController.findOne(UserServiceMock.userMock);
    expect(spyFindOne).toBeCalledWith(UserServiceMock.userMock);
  });

  it('Validate create', async () => {
    const spyCreate = jest.spyOn(attendanceService, 'create');
    attendanceController.create(
      AttendanceServiceMock.createAttendanceDto,
      UserServiceMock.userMock,
    );
    expect(spyCreate).toBeCalledWith(
      AttendanceServiceMock.createAttendanceDto,
      UserServiceMock.userMock,
    );
  });

  it('Validate historyAttendance', async () => {
    const spyHistoryAttendance = jest.spyOn(attendanceService, 'historyAttendance');
    attendanceController.historyAttendance(UserServiceMock.userMock);
    expect(spyHistoryAttendance).toBeCalledWith(UserServiceMock.userMock);
  });

  it('Validate Update', async () => {
    const spyUpdate = jest.spyOn(attendanceService, 'update');
    attendanceController.update(UserServiceMock.userMock);
    expect(spyUpdate).toBeCalledWith(UserServiceMock.userMock);
  });

  it('Validate reportAttendanceByUser', async () => {
    const spyReportAttendance = jest.spyOn(attendanceService, 'reportAttendanceByUser');
    await attendanceController.reportAttendanceByUser(AttendanceServiceMock.reportAttendanceDto);
    expect(spyReportAttendance).toBeCalledWith(AttendanceServiceMock.reportAttendanceDto);
  });

  it('Validate reportChartsAttendance', async () => {
    const spyReportAttendance = jest.spyOn(attendanceService, 'reportChartsAttendance');
    await attendanceController.reportChartsAttendance(AttendanceServiceMock.reportChartAttendance);
    expect(spyReportAttendance).toBeCalledWith(AttendanceServiceMock.reportChartAttendance);
  });

  it('Validate reportChartsAttendanceByUser', async () => {
    const spyReportAttendance = jest.spyOn(attendanceService, 'reportChartsAttendanceByUser');
    await attendanceController.reportChartsAttendanceByUser(
      AttendanceServiceMock.reportChartAttendance,
    );
    expect(spyReportAttendance).toBeCalledWith(AttendanceServiceMock.reportChartAttendance);
  });
});
