import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constants } from '../common/constants/Constant';
import { Util } from '../common/utils/util';
import { ScheduleServiceMock } from '../schedule/schedule.mock.spec';
import { ScheduleService } from '../schedule/schedule.service';
import { User } from '../user/entities/user.entity';
import { UserServiceMock } from '../user/user.mock.spec';
import { AttendanceServiceMock } from './attendance.mock.spec';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';

describe('AttendanceService', () => {
  let attendanceService: AttendanceService;
  let scheduleService: ScheduleService;
  let mockService: AttendanceServiceMock = new AttendanceServiceMock();
  const formatDateId: number = 20221008;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockService,
        },
        {
          provide: ScheduleService,
          useValue: mockService,
        },
      ],
    }).compile();

    attendanceService = module.get<AttendanceService>(AttendanceService);
    scheduleService = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(attendanceService).toBeDefined();
  });

  it('Validate create ERROR validateRegisterDate out schedule ', async () => {
    const spyValidateRegisterDate = jest
      .spyOn(Util, 'validateRegisterDate')
      .mockReturnValueOnce(false);
    await expect(
      attendanceService.create(AttendanceServiceMock.createAttendanceDto, UserServiceMock.userMock),
    ).rejects.toThrowError(
      new BadRequestException({
        message: 'Se encuentra fuera de horario',
      }),
    );
    expect(spyValidateRegisterDate).toBeCalled();
  });

  it('Validate create register Error ', async () => {
    const spyValidateRegisterDate = jest
      .spyOn(Util, 'validateRegisterDate')
      .mockReturnValueOnce(true);
    const spyValidateIsLater = jest.spyOn(Util, 'isLater').mockReturnValueOnce(true);
    const spySaveError = jest.spyOn(mockService, 'save').mockRejectedValueOnce(new Error());
    await expect(
      attendanceService.create(AttendanceServiceMock.createAttendanceDto, UserServiceMock.userMock),
    ).rejects.toThrowError(
      new InternalServerErrorException('Sucedio un error al crear el Attendance'),
    );
    expect(spySaveError).toBeCalled();
    expect(spyValidateRegisterDate).toBeCalled();
    expect(spyValidateIsLater).toBeCalled();
  });

  it('Validate create OK', async () => {
    const spyValidateRegisterDate = jest
      .spyOn(Util, 'validateRegisterDate')
      .mockReturnValueOnce(true);
    const spyFindScheduleByUser = jest.spyOn(mockService, 'findScheduleByUser');
    const spyValidateIsLater = jest.spyOn(Util, 'isLater').mockReturnValueOnce(false);
    const spyCreate = jest
      .spyOn(mockService, 'create')
      .mockReturnValueOnce(AttendanceServiceMock.attendance);
    const spySave = jest.spyOn(mockService, 'save');
    const { message } = await attendanceService.create(
      AttendanceServiceMock.createAttendanceDto,
      UserServiceMock.userMock,
    );
    expect(spyCreate).toBeCalledWith({
      codUser: UserServiceMock.userMock.id,
      description: AttendanceServiceMock.createAttendanceDto.description,
      isLater: false,
    });
    expect(spySave).toBeCalledWith(AttendanceServiceMock.attendance);
    expect(message).toEqual(Constants.MSG_OK);
    expect(spyValidateIsLater).toBeCalled();
    expect(spyValidateRegisterDate).toBeCalled();
    expect(spyFindScheduleByUser).toBeCalledWith(UserServiceMock.userMock.id);
  });

  it('Validate isActiveAttendance OK', async () => {
    const spyFindOneOrFail = jest
      .spyOn(mockService, 'findOneOrFail')
      .mockResolvedValueOnce({ isActive: true });
    const spyUtilFormatDateId = jest.spyOn(Util, 'formatDateId').mockReturnValueOnce(formatDateId);
    const isActive = await attendanceService.isActiveAttendance(UserServiceMock.userMock);
    expect(spyFindOneOrFail).toBeCalledWith({
      where: { id: formatDateId, codUser: UserServiceMock.userMock.id },
    });
    expect(spyUtilFormatDateId).toBeCalled();
    expect(isActive).toBeTruthy();
  });

  it('Validate isActiveAttendance Error', async () => {
    const spyFindOneOrFail = jest
      .spyOn(mockService, 'findOneOrFail')
      .mockRejectedValueOnce(new Error());
    await expect(
      attendanceService.isActiveAttendance(UserServiceMock.userMock),
    ).rejects.toThrowError(
      new InternalServerErrorException('Sucedio un error al validar Attendance'),
    );
    expect(spyFindOneOrFail).toBeCalled();
  });

  it('Validate Update Error validate not override attendance', async () => {
    const spyActiveAttendance = jest
      .spyOn(attendanceService, 'isActiveAttendance')
      .mockResolvedValueOnce(false);

    await expect(attendanceService.update(UserServiceMock.userMock)).rejects.toThrowError(
      new BadRequestException('Ya fue actualizado su Attendance anteriormente'),
    );
    expect(spyActiveAttendance).toBeCalled();
  });

  it('Valdiate Update Error Not Affected', async () => {
    jest.spyOn(attendanceService, 'isActiveAttendance').mockResolvedValueOnce(true);
    const spyExecute = jest.spyOn(mockService, 'execute').mockResolvedValueOnce({ affected: 0 });
    await expect(attendanceService.update(UserServiceMock.userMock)).rejects.toThrowError(
      new InternalServerErrorException('Sucedio un error al actualizar Attendance'),
    );
    expect(spyExecute).toBeCalled();
  });

  it('Valdiate Update Error Database', async () => {
    jest.spyOn(attendanceService, 'isActiveAttendance').mockResolvedValueOnce(true);
    const spyExecute = jest.spyOn(mockService, 'execute').mockRejectedValueOnce(new Error());
    await expect(attendanceService.update(UserServiceMock.userMock)).rejects.toThrowError(
      new InternalServerErrorException('Sucedio un error al actualizar Attendance'),
    );
    expect(spyExecute).toBeCalled();
  });

  it('Validate Update Ok ', async () => {
    jest.spyOn(attendanceService, 'isActiveAttendance').mockResolvedValueOnce(true);
    const spyUitlFormatDate = jest.spyOn(Util, 'formatDateId').mockReturnValueOnce(formatDateId);
    const spyCreateQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spyUpdate = jest.spyOn(mockService, 'update');
    const spySet = jest.spyOn(mockService, 'set');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyExecute = jest.spyOn(mockService, 'execute').mockResolvedValueOnce({ affected: 1 });
    const { message } = await attendanceService.update(UserServiceMock.userMock);
    expect(message).toEqual(Constants.MSG_OK);
    expect(spyCreateQueryBuilder).toBeCalled();
    expect(spyUpdate).toBeCalledWith(Attendance);
    expect(spySet).toBeCalledWith({
      isActive: false,
    });
    expect(spyWhere).toBeCalledWith('codUser = :codUser and id = :id', {
      codUser: UserServiceMock.userMock.id,
      id: formatDateId,
    });
    expect(spyExecute).toBeCalled();
    expect(spyUitlFormatDate).toBeCalled();
  });

  it('Validate historyAttendance', async () => {
    const spyQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyAddSelect = jest.spyOn(mockService, 'addSelect');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyGetRawMany = jest
      .spyOn(mockService, 'getRawMany')
      .mockResolvedValueOnce(AttendanceServiceMock.listHistoryStatusAttendance);
    const spyOrderBy = jest.spyOn(mockService, 'orderBy');
    const spyLimit = jest.spyOn(mockService, 'limit');
    const spyUtilFormatLocalDate = jest.spyOn(Util, 'formatLocalDate');
    const { listHistoryStatusAttendance } = await attendanceService.historyAttendance(
      UserServiceMock.userMock,
    );
    expect(spyQueryBuilder).toBeCalledWith('ATTENDANCE');
    expect(spySelect).toBeCalledWith('ATTENDANCE.date', 'date');
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'ATTENDANCE.isActive', 'isActive');
    expect(spyAddSelect).toHaveBeenNthCalledWith(2, 'ATTENDANCE.isLater', 'isLater');
    expect(spyAddSelect).toHaveBeenNthCalledWith(3, 'ATTENDANCE.isAbsent', 'isAbsent');
    expect(spyAddSelect).toHaveBeenNthCalledWith(4, 'ATTENDANCE.isDayOff', 'isDayOff');
    expect(spyInnerJoin).toHaveBeenNthCalledWith(1, User, 'USER', 'USER.id = ATTENDANCE.codUser');
    expect(spyWhere).toBeCalledWith('USER.id =:id', { id: UserServiceMock.userMock.id });
    expect(spyOrderBy).toBeCalledWith('ATTENDANCE.date', 'DESC');
    expect(spyLimit).toBeCalledWith(14);
    expect(spyUtilFormatLocalDate).toBeCalled();
    expect(spyGetRawMany).toBeCalled();
    expect(listHistoryStatusAttendance).toEqual(AttendanceServiceMock.listHistoryStatusAttendance);
  });

  it('Validate findOne OK', async () => {
    const spyUtilFormatDateId = jest.spyOn(Util, 'formatDateId').mockReturnValue(null);
    const spyFindOne = jest.spyOn(mockService, 'findOneBy').mockResolvedValueOnce(null);
    await attendanceService.findOne(UserServiceMock.userMock);
    expect(spyFindOne).toBeCalled();
    expect(spyUtilFormatDateId).toBeCalled();
  });

  it('Validate findOne Error', async () => {
    jest.spyOn(Util, 'validateRegisterDate').mockReturnValueOnce(true);
    const spyFindOneError = jest.spyOn(mockService, 'findOneBy').mockRejectedValueOnce(new Error());
    await expect(attendanceService.findOne(UserServiceMock.userMock)).rejects.toThrowError(
      new InternalServerErrorException('Sucedio un error al buscar el Attendance'),
    );
    expect(spyFindOneError).toBeCalled();
  });

  it('Validate reportAttendanceByUser', async () => {
    const {
      id,
      dateRange: [initDate, endDate],
    } = AttendanceServiceMock.reportAttendanceDto;
    const spyQuery = jest.spyOn(mockService, 'query').mockResolvedValueOnce([]);
    await attendanceService.reportAttendanceByUser(AttendanceServiceMock.reportAttendanceDto);
    expect(spyQuery).toBeCalledWith('CALL REPORT_ATTENDANCE_BY_USER(?,?,?)', [
      id,
      initDate,
      endDate,
    ]);
  });
});
