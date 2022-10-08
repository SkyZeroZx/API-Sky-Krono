import { Test, TestingModule } from '@nestjs/testing';
import { TypeController } from './type.controller';
import { TypeServiceMock } from './type.mock.spec';
import { TypeService } from './type.service';

describe('TypeController', () => {
  let typeController: TypeController;
  let typeService: TypeService;
  let mockService: TypeServiceMock = new TypeServiceMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeController],
      providers: [{ provide: TypeService, useValue: mockService }],
    }).compile();
    typeController = module.get<TypeController>(TypeController);
    typeService = module.get<TypeService>(TypeService);
  });

  it('should be defined', () => {
    expect(typeController).toBeDefined();
  });

  it('Validate create', () => {
    const spyCreate = jest.spyOn(typeService, 'create');
    typeController.create(TypeServiceMock.createTypeDto);
    expect(spyCreate).toBeCalledWith(TypeServiceMock.createTypeDto);
  });

  it('Validate update', () => {
    const spyUpdate = jest.spyOn(typeService, 'update');
    typeController.update(TypeServiceMock.updateTypeDto);
    expect(spyUpdate).toBeCalled();
  });

  it('Validate remove', () => {
    const spyRemove = jest.spyOn(typeService, 'remove');
    typeController.delete(TypeServiceMock.type.codType);
    expect(spyRemove).toBeCalledWith(TypeServiceMock.type.codType);
  });

  it('Validamos findAll', async () => {
    const spyCreate = jest
      .spyOn(typeService, 'findAll')
      .mockResolvedValueOnce(TypeServiceMock.listType);
    const listType = await typeController.findAll();
    expect(spyCreate).toBeCalled();
    expect(listType).toEqual(TypeServiceMock.listType);
  });
});
