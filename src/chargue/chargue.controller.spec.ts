import { Test, TestingModule } from '@nestjs/testing';
import { ChargueController } from './chargue.controller';
import { ChargueServiceMock } from './chargue.mock.spec';
import { ChargueService } from './chargue.service';

describe('ChargueController', () => {
  let chargueController: ChargueController;
  let chargueService: ChargueService;
  let mockService: ChargueServiceMock = new ChargueServiceMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChargueController],
      providers: [{ provide: ChargueService, useValue: mockService }],
    }).compile();

    chargueController = module.get<ChargueController>(ChargueController);
    chargueService = module.get<ChargueService>(ChargueService);
  });

  it('should be defined', () => {
    expect(chargueController).toBeDefined();
  });

  it('Validate create', () => {
    const spyCreate = jest.spyOn(mockService, 'create');
    chargueController.create(ChargueServiceMock.createChargueDto);
    expect(spyCreate).toBeCalledWith(ChargueServiceMock.createChargueDto);
  });

  it('Validate findAll', () => {
    const spyFindAll = jest.spyOn(mockService, 'findAll');
    chargueController.findAll();
    expect(spyFindAll).toBeCalled();
  });

  it('Validate update', () => {
    const spyUpdate = jest.spyOn(mockService, 'update');
    chargueController.update(ChargueServiceMock.updateChargueDto);
    expect(spyUpdate).toBeCalled();
  });

  it('Validate remove', () => {
    const spyRemove = jest.spyOn(mockService, 'remove');
    chargueController.remove(ChargueServiceMock.chargue.id);
    expect(spyRemove).toBeCalledWith(ChargueServiceMock.chargue.id);
  });
});
