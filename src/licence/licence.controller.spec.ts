import { Test, TestingModule } from '@nestjs/testing';
import { LicenceController } from './licence.controller';
import { LicenceService } from './licence.service';

describe('LicenceController', () => {
  let controller: LicenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LicenceController],
      providers: [LicenceService],
    }).compile();

    controller = module.get<LicenceController>(LicenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
