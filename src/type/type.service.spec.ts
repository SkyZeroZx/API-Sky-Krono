import { Test, TestingModule } from '@nestjs/testing';
import { TypeService } from './type.service';
import { Type } from './entities/type.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeServiceMock } from './type.mock.spec';
import { Constants } from '../common/constants/Constant';
import { InternalServerErrorException } from '@nestjs/common';

describe('TypeService', () => {
  let typeService: TypeService;
  let mockService: TypeServiceMock = new TypeServiceMock();

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
    typeService = module.get<TypeService>(TypeService);
  });

  it('should be defined', () => {
    expect(typeService).toBeDefined();
  });

  it('Validate create OK', async () => {
    const spySave = jest.spyOn(mockService, 'save');
    const { message } = await typeService.create(TypeServiceMock.createTypeDto);
    expect(spySave).toBeCalledWith(TypeServiceMock.createTypeDto);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('Validate create Error', async () => {
    const spySaveError = jest.spyOn(mockService, 'save').mockRejectedValueOnce(new Error());
    await expect(typeService.create(TypeServiceMock.createTypeDto)).rejects.toThrowError(
      new InternalServerErrorException('Sucedio un error al registrar nuevo tipo'),
    );
    expect(spySaveError).toBeCalled();
  });

  it('Validate update OK', async () => {
    const spyCreate = jest.spyOn(mockService, 'create').mockReturnValueOnce(TypeServiceMock.type);
    const spyUpdate = jest.spyOn(mockService, 'update').mockResolvedValueOnce({ affected: 1 });
    const { message } = await typeService.update(TypeServiceMock.updateTypeDto);

    expect(spyUpdate).toBeCalledWith(
      { codType: TypeServiceMock.updateTypeDto.codType },
      TypeServiceMock.type,
    );
    expect(spyCreate).toBeCalled();
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('Validate update Error', async () => {
    const spyUpdateError = jest.spyOn(mockService, 'update').mockRejectedValueOnce(new Error());
    await expect(typeService.update(TypeServiceMock.updateTypeDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al actualizar el Type',
      }),
    );
    expect(spyUpdateError).toBeCalled();
  });

  it('Validate update error no affected', async () => {
    const spyUpdateError = jest.spyOn(mockService, 'update').mockResolvedValueOnce({ affected: 0 });
    await expect(typeService.update(TypeServiceMock.updateTypeDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al actualizar el Type',
      }),
    );
    expect(spyUpdateError).toBeCalled();
  });

  it('Validamos findAll OK', async () => {
    const spyFind = jest.spyOn(mockService, 'find').mockImplementation(() => {
      return TypeServiceMock.listType;
    });
    await typeService.findAll();
    expect(spyFind).toBeCalled();
  });

  it('Validate remove OK', async () => {
    const spyDelete = jest.spyOn(mockService, 'delete');
    const { message } = await typeService.remove(TypeServiceMock.type.codType);
    expect(message).toEqual(Constants.MSG_OK);
    expect(spyDelete).toBeCalledWith(TypeServiceMock.type.codType);
  });

  it('Validate remove Error', async () => {
    const spyDeleteError = jest.spyOn(mockService, 'delete').mockRejectedValueOnce(new Error());
    await expect(typeService.remove(TypeServiceMock.type.codType)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al eliminar el Type',
      }),
    );
    expect(spyDeleteError).toBeCalled();
  });
});
