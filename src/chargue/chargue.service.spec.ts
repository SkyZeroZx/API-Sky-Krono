import { Test, TestingModule } from '@nestjs/testing';
import { ChargueService } from './chargue.service';

xdescribe('ChargueService', () => {
  let service: ChargueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChargueService],
    }).compile();

    service = module.get<ChargueService>(ChargueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
