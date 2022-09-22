import { Test, TestingModule } from '@nestjs/testing';
import { LicenceService } from './licence.service';

describe('LicenceService', () => {
  let service: LicenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LicenceService],
    }).compile();

    service = module.get<LicenceService>(LicenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
