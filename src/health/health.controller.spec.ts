import {
  HealthCheckService,
  MemoryHealthIndicator,
  TerminusModule,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let healthController: HealthController;
  let healthCheckService: HealthCheckService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      imports: [TerminusModule],
      providers: [
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn().mockResolvedValue(null),
            checkRSS: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();
    healthController = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(healthController).toBeDefined();
  });

  it('Validate check', async () => {
    const spyHealthCheckService = jest.spyOn(healthCheckService, 'check');

    await healthController.check();
    expect(spyHealthCheckService).toBeCalled();
  });
});
