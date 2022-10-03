import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificacionService } from '../notificacion/notificacion.service';
import { ScheduleServiceMock } from './schedule.mock.spec';
import { ScheduleService } from './schedule.service';
import { ScheduleModule as ScheduleModuleNestJs } from '@nestjs/schedule';
import { Schedule } from './entities/schedule.entity';

describe('ScheduleService', () => {
  let scheduleService: ScheduleService;
  let mockService: ScheduleServiceMock = new ScheduleServiceMock();
  let schedulerRegistry: SchedulerRegistry;
  let notificacionService: NotificacionService;
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
          provide: NotificacionService,
          useValue: mockService,
        },
      ],
      imports: [ScheduleModuleNestJs.forRoot()],
    }).compile();
    scheduleService = module.get<ScheduleService>(ScheduleService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
    notificacionService = module.get<NotificacionService>(NotificacionService);
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

  it('Validate create OK', () => {});
});
