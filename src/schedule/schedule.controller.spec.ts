import { Test, TestingModule } from '@nestjs/testing';
import { Util } from '../common/utils/util';
import { UserServiceMock } from '../user/user.mock.spec';
import { ScheduleController } from './schedule.controller';
import { ScheduleServiceMock } from './schedule.mock.spec';
import { ScheduleService } from './schedule.service';

describe('ScheduleController', () => {
  let scheduleController: ScheduleController;
  let scheduleService: ScheduleService;
  let mockService: ScheduleServiceMock = new ScheduleServiceMock();
  const { id } = ScheduleServiceMock.schedule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [{ provide: ScheduleService, useValue: mockService }],
    }).compile();
    scheduleController = module.get<ScheduleController>(ScheduleController);
    scheduleService = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(scheduleController).toBeDefined();
  });

  it('Validate create', () => {
    const spyCreate = jest.spyOn(scheduleService, 'create');
    scheduleController.create(ScheduleServiceMock.createScheduleDto);
    expect(spyCreate).toBeCalledWith(ScheduleServiceMock.createScheduleDto);
  });

  it('Validate findAll', () => {
    const spyFindAll = jest.spyOn(scheduleService, 'findAll');
    scheduleController.findAll();
    expect(spyFindAll).toBeCalled();
  });

  it('Validate update', () => {
    const spyUpdate = jest.spyOn(scheduleService, 'update');
    scheduleController.update(ScheduleServiceMock.updateScheduleDto);
    expect(spyUpdate).toBeCalledWith(ScheduleServiceMock.updateScheduleDto);
  });

  it('Valite remove', () => {
    const spyRemove = jest.spyOn(scheduleService, 'remove');
    scheduleController.remove(id);
    expect(spyRemove).toBeCalledWith(id);
  });

  it('Validate findScheduleByUser', async () => {
    const spyFindScheduleByUser = jest
      .spyOn(scheduleService, 'findScheduleByUser')
      .mockResolvedValueOnce(ScheduleServiceMock.schedule);
    const spyUtil = jest.spyOn(Util, 'validateRegisterDate');
    const data = await scheduleController.findScheduleByUser(UserServiceMock.userMock);
    expect(spyFindScheduleByUser).toBeCalledWith(UserServiceMock.userMock.id);
    expect(spyUtil).toBeCalledWith(ScheduleServiceMock.schedule);
    expect(data).toEqual({
      dayIsValid: Util.validateRegisterDate(ScheduleServiceMock.schedule),
      schedule: ScheduleServiceMock.schedule,
    });
  });
});
