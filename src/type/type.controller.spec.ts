import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Type } from './entities/type.entity';
import { TypeController } from './type.controller';
import { TypeService } from './type.service';

describe('TypeController', () => {
  let controller: TypeController;
  let service: TypeService;
  const listaTypes: Type[] = [
    {
      codType: 1,
      typeDescription: 'TEST',
      backgroundColor: '#ffff',
      borderColor: '#ffff',
      start: new Date(),
      end: new Date(),
      display: 'TEST DISPLAY',
    },
    {
      codType: 2,
      typeDescription: 'TEST 2',
      backgroundColor: '#ffff',
      borderColor: '#ffff',
      start: new Date(),
      end: new Date(),
      display: 'TEST DISPLAY 2',
    },
  ];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeController],
      providers: [
        TypeService,
        {
          provide: getRepositoryToken(Type),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<TypeController>(TypeController);
    service = module.get<TypeService>(TypeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Validamos findAll', async () => {
    const spyCreate = jest.spyOn(service, 'findAll').mockImplementation(async () => {
      return listaTypes;
    });
    const types = await controller.findAll();
    expect(spyCreate).toBeCalled();
    expect(types).toEqual(listaTypes);
  });
});
