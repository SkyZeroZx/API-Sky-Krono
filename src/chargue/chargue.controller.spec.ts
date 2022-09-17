import { Test, TestingModule } from '@nestjs/testing';
import { ChargueController } from './chargue.controller';
import { ChargueService } from './chargue.service';

xdescribe('ChargueController', () => {
  let controller: ChargueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChargueController],
      providers: [ChargueService],
    }).compile();

    controller = module.get<ChargueController>(ChargueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
