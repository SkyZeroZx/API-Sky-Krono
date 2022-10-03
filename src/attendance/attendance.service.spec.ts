import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttendanceServiceMock } from './attendance.mock.spec';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';

xdescribe('AttendanceService', () => {
  let service: AttendanceService;
  let mockService: AttendanceServiceMock = new AttendanceServiceMock();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockService,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
