import { Test, TestingModule } from '@nestjs/testing';
import { TypeService } from './type.service';
import { Type } from './entities/type.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TypeService', () => {
  let service: TypeService;
  let mockService = {
    find: jest.fn(),
  };
  const mockListaType: Type[] = [
    {
      codType: 1,
      typeDescription: 'Test Description 1',
      backgroundColor: 'rgba(255,255,255,0.5)',
      borderColor: 'rgba(255,255,255,0.5)',
      start: new Date(),
      end: new Date(),
      display: 'BLOCK',
    },
    {
      codType: 1,
      typeDescription: 'Test Description 2',
      backgroundColor: 'rgba(255,255,255,0.5)',
      borderColor: 'rgba(255,255,255,0.5)',
      start: new Date(),
      end: new Date(),
      display: 'BLOCK 2',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeService,
        {
          provide: getRepositoryToken(Type),
          useValue: mockService,
        },
      ],
    }).compile();

    service = module.get<TypeService>(TypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Validamos findAll OK', async () => {
    const spyFind = jest.spyOn(mockService, 'find').mockImplementation(() => {
      return mockListaType;
    });
    await service.findAll();
    expect(spyFind).toBeCalled();
  });
});
