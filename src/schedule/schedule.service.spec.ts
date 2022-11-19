import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScheduleServiceMock } from './schedule.mock.spec';
import { ScheduleService } from './schedule.service';
import { ScheduleModule as ScheduleModuleNestJs } from '@nestjs/schedule';
import { Schedule } from './entities/schedule.entity';
import { Constants } from '../common/constants/Constant';
import { InternalServerErrorException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Util } from '../common/utils/util';
import Cron from 'cron';
import { NotificationService } from '../notification/notification.service';

describe('ScheduleService', () => {
  let scheduleService: ScheduleService;
  let mockService: ScheduleServiceMock = new ScheduleServiceMock();
  let schedulerRegistry: SchedulerRegistry;
  let notificationService: NotificationService;
  const { id } = ScheduleServiceMock.schedule;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: getRepositoryToken(Schedule),
          useValue: mockService,
        },
        {
          provide: SchedulerRegistry,
          useValue: mockService,
        },
        {
          provide: NotificationService,
          useValue: mockService,
        },
      ],
      imports: [ScheduleModuleNestJs.forRoot()],
    }).compile();
    scheduleService = module.get<ScheduleService>(ScheduleService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(scheduleService).toBeDefined();
  });

  it('Validate onModuleInit', () => {
    const spyRestartSavedCrons = jest
      .spyOn(scheduleService, 'restartSavedCrons')
      .mockResolvedValueOnce(null);
    scheduleService.onModuleInit();
    expect(spyRestartSavedCrons).toBeCalled();
  });

  it('Validate create OK', async () => {
    const spySave = jest
      .spyOn(mockService, 'save')
      .mockResolvedValueOnce(ScheduleServiceMock.schedule);
    const spyRegisterCronJob = jest.spyOn(scheduleService, 'registerCronJob').mockReturnValue(null);
    const { message } = await scheduleService.create(ScheduleServiceMock.createScheduleDto);
    expect(spySave).toBeCalledWith(ScheduleServiceMock.createScheduleDto);
    expect(spyRegisterCronJob).toBeCalledWith(ScheduleServiceMock.schedule);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('Validate create ERROR', async () => {
    const spySaveError = jest.spyOn(mockService, 'save').mockRejectedValue(new Error());
    const spyRegisterCronJob = jest.spyOn(scheduleService, 'registerCronJob').mockReturnValue(null);
    await expect(
      scheduleService.create(ScheduleServiceMock.createScheduleDto),
    ).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al crear el Schedule',
      }),
    );
    expect(spySaveError).toBeCalledWith(ScheduleServiceMock.createScheduleDto);
    expect(spyRegisterCronJob).not.toBeCalled();
  });

  it('Validate findAll', async () => {
    const spyFind = jest
      .spyOn(mockService, 'find')
      .mockResolvedValueOnce(ScheduleServiceMock.listSchedule);
    const listSchedule = await scheduleService.findAll();
    expect(listSchedule).toEqual(ScheduleServiceMock.listSchedule);
    expect(spyFind).toBeCalled();
  });

  it('Validate findScheduleByUser', async () => {
    const spyQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyAddSelect = jest.spyOn(mockService, 'addSelect');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyGetRawOne = jest.spyOn(mockService, 'getRawOne');
    await scheduleService.findScheduleByUser(id);

    expect(spyQueryBuilder).toBeCalledWith('SCHEDULE');
    expect(spySelect).toBeCalledWith('SCHEDULE.entryHour', 'entryHour');
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'SCHEDULE.exitHour', 'exitHour');
    expect(spyAddSelect).toHaveBeenNthCalledWith(2, 'SCHEDULE.monday', 'monday');
    expect(spyAddSelect).toHaveBeenNthCalledWith(3, 'SCHEDULE.tuesday', 'tuesday');
    expect(spyAddSelect).toHaveBeenNthCalledWith(4, 'SCHEDULE.wednesday', 'wednesday');
    expect(spyAddSelect).toHaveBeenNthCalledWith(5, 'SCHEDULE.thursday', 'thursday');
    expect(spyAddSelect).toHaveBeenNthCalledWith(6, 'SCHEDULE.friday', 'friday');
    expect(spyAddSelect).toHaveBeenNthCalledWith(7, 'SCHEDULE.saturday', 'saturday');
    expect(spyAddSelect).toHaveBeenNthCalledWith(8, 'SCHEDULE.sunday', 'sunday');
    expect(spyAddSelect).toHaveBeenNthCalledWith(9, 'SCHEDULE.toleranceTime', 'toleranceTime');
    expect(spyAddSelect).toHaveBeenNthCalledWith(
      10,
      'SCHEDULE.notificationIsActive',
      'notificationIsActive',
    );
    expect(spyInnerJoin).toBeCalledWith(User, 'USER', 'SCHEDULE.id = USER.codSchedule');
    expect(spyWhere).toBeCalledWith('USER.id =:id', { id: id });
    expect(spyGetRawOne).toBeCalled();
  });

  it('Validate update Ok', async () => {
    const spyCreate = jest.spyOn(mockService, 'create').mockImplementationOnce(() => {
      return ScheduleServiceMock.schedule;
    });
    const spyUpdate = jest.spyOn(mockService, 'update').mockResolvedValueOnce({ affected: 1 });
    const spyupdateCronJob = jest.spyOn(scheduleService, 'updateCronJob').mockReturnValueOnce(null);
    const { message } = await scheduleService.update(ScheduleServiceMock.updateScheduleDto);
    expect(spyUpdate).toBeCalled();
    expect(spyCreate).toBeCalled();
    expect(spyupdateCronJob).toBeCalled();
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('Validate update ERROR', async () => {
    //In case affected is 0
    const spyUpdate = jest.spyOn(mockService, 'update').mockResolvedValueOnce({ affected: 0 });
    await expect(
      scheduleService.update(ScheduleServiceMock.updateScheduleDto),
    ).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al actualizar el Schedule',
      }),
    );
    expect(spyUpdate).toBeCalledTimes(1);
    // In case promise is rejected
    spyUpdate.mockRejectedValueOnce(new Error());
    await expect(
      scheduleService.update(ScheduleServiceMock.updateScheduleDto),
    ).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al actualizar el Schedule',
      }),
    );
    expect(spyUpdate).toBeCalledTimes(2);
  });

  it('Validate remove OK', async () => {
    const spyDelete = jest.spyOn(mockService, 'delete');
    const spyFindScheduleById = jest
      .spyOn(scheduleService, 'findScheduleById')
      .mockResolvedValueOnce(ScheduleServiceMock.scheduleNotificationEnabled);
    const spyDeleteCronJob = jest.spyOn(mockService, 'deleteCronJob');
    const { message } = await scheduleService.remove(id);
    expect(spyDelete).toBeCalled();
    expect(spyDeleteCronJob).toBeCalled();
    expect(spyFindScheduleById).toBeCalled();
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('Validate remove Error', async () => {
    const spyFindScheduleById = jest
      .spyOn(scheduleService, 'findScheduleById')
      .mockResolvedValueOnce(ScheduleServiceMock.scheduleNotificationEnabled)
      .mockResolvedValueOnce(ScheduleServiceMock.scheduleNotificationEnabled);
    const spyDeleteError = jest.spyOn(mockService, 'delete').mockRejectedValueOnce(new Error());
    await expect(scheduleService.remove(id)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al eliminar el Schedule',
      }),
    );
    expect(spyDeleteError).toBeCalled();
    expect(spyFindScheduleById).toBeCalled();
  });

  it('Validate updateCronJob Enabled Notifications', async () => {
    const spyGetCronJob = jest.spyOn(mockService, 'getCronJob');
    const spyUtilFormatCronJob = jest.spyOn(Util, 'formatCronJob');
    const spySetTime = jest.spyOn(mockService, 'setTime');
    const spyCronTime = jest.spyOn(Cron, 'CronTime').mockReturnValueOnce(null);
    scheduleService.updateCronJob(ScheduleServiceMock.updateScheduleDto);
    expect(spyGetCronJob).toBeCalledWith(
      ScheduleServiceMock.updateScheduleDto.codSchedule.toString(),
    );
    expect(spyUtilFormatCronJob).toBeCalled();
    expect(spyCronTime).toBeCalledWith(
      Util.formatCronJob(ScheduleServiceMock.updateScheduleDto as any),
    );
    expect(spySetTime).toBeCalled();
  });

  it('Validate updateCronJob Disabled Notifications', async () => {
    const spyCronJobStop = jest.spyOn(mockService, 'stop');
    scheduleService.updateCronJob(ScheduleServiceMock.disabledNotifications);
    expect(spyCronJobStop).toBeCalled();
  });

  it('Validate restartSavedCrons OK', async () => {
    const spyFind = jest
      .spyOn(mockService, 'find')
      .mockResolvedValueOnce(ScheduleServiceMock.listSchedule);
    const spyRegisterCronJob = jest.spyOn(scheduleService, 'registerCronJob');
    await scheduleService.restartSavedCrons();
    expect(spyFind).toBeCalled();
    expect(spyRegisterCronJob).toBeCalledTimes(ScheduleServiceMock.listSchedule.length);
  });

  it('Validate registerCronJob', async () => {
    const spyUtilFormatCronJob = jest
      .spyOn(Util, 'formatCronJob')
      .mockReturnValueOnce(ScheduleServiceMock.cronTimeString);
    const spyCronJob = jest.spyOn(Cron, 'CronJob').mockImplementationOnce(() => {
      return ScheduleServiceMock.cronJob;
    });

    const spyAddCronJob = jest.spyOn(mockService, 'addCronJob');
    const spyCronStop = jest.spyOn(ScheduleServiceMock.cronJob, 'stop');
    scheduleService.registerCronJob(ScheduleServiceMock.schedule);
    expect(spyUtilFormatCronJob).toBeCalledWith(ScheduleServiceMock.schedule);
    expect(spyAddCronJob).toBeCalledWith(id.toString(), ScheduleServiceMock.cronJob);
    expect(spyCronJob).toBeCalledWith(ScheduleServiceMock.cronTimeString, expect.any(Function));
    expect(spyCronStop).toBeCalled();
  });

  it('Validate findScheduleById OK', async () => {
    const spyFindOneByOrFail = jest
      .spyOn(mockService, 'findOneByOrFail')
      .mockResolvedValueOnce(ScheduleServiceMock.schedule);
    await scheduleService.findScheduleById(id);
    expect(spyFindOneByOrFail).toBeCalledWith({ id });
  });

  it('Validate findScheduleById ERROR', async () => {
    const spyFindOneByOrFailError = jest
      .spyOn(mockService, 'findOneByOrFail')
      .mockRejectedValueOnce(new Error());
    await expect(scheduleService.findScheduleById(id)).rejects.toThrowError(
      new InternalServerErrorException('Sucedio un error al buscar schedule'),
    );
    expect(spyFindOneByOrFailError).toBeCalledWith({ id });
  });

  it('Validate sendNotificationBySchedule', async () => {
    const spyFindTokensBySchedule = jest
      .spyOn(notificationService, 'findTokensBySchedule')
      .mockResolvedValueOnce(ScheduleServiceMock.listTokens);
    const spySendNotification = jest.spyOn(notificationService, 'sendNotification');
    await scheduleService.sendNotificationBySchedule(ScheduleServiceMock.schedule);
    expect(spyFindTokensBySchedule).toBeCalledWith(id);
    for (let i = 0; i < ScheduleServiceMock.listTokens.length; i++) {
      expect(spySendNotification).toHaveBeenNthCalledWith(
        i + 1,
        ScheduleServiceMock.listTokens[i].tokenPush,
        Constants.NOTIFICATION_REMEMBER_ATTEDANCE,
      );
    }
  });
});
