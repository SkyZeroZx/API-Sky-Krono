import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constants } from '../common/constants/Constant';
import { ChargueServiceMock } from './chargue.mock.spec';
import { ChargueService } from './chargue.service';
import { Chargue } from './entities/chargue.entity';

describe('ChargueService', () => {
  let chargueService: ChargueService;
  let mockService: ChargueServiceMock = new ChargueServiceMock();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChargueService,
        {
          provide: getRepositoryToken(Chargue),
          useValue: mockService,
        },
      ],
    }).compile();

    chargueService = module.get<ChargueService>(ChargueService);
  });

  it('should be defined', () => {
    expect(chargueService).toBeDefined();
  });

  it('Validate create OK', async () => {
    const spySave = jest.spyOn(mockService, 'save');
    const { message } = await chargueService.create(ChargueServiceMock.createChargueDto);
    expect(spySave).toBeCalledWith(ChargueServiceMock.createChargueDto);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('Validate create Error', async () => {
    const spySaveError = jest.spyOn(mockService, 'save').mockRejectedValueOnce(new Error());
    await expect(chargueService.create(ChargueServiceMock.createChargueDto)).rejects.toThrowError(
      new InternalServerErrorException('Sucedio un error al crear el chargue'),
    );
    expect(spySaveError).toBeCalled();
  });

  it('Validate findAll', async () => {
    const spyFind = jest.spyOn(mockService, 'find');
    chargueService.findAll();
    expect(spyFind).toBeCalled();
  });

  it('Validate update OK', async () => {
    const spyUpdate = jest.spyOn(mockService, 'update').mockResolvedValueOnce({ affected: 1 });
    const { message } = await chargueService.update(ChargueServiceMock.updateChargueDto);

    expect(spyUpdate).toBeCalledWith(
      { id: ChargueServiceMock.updateChargueDto.codChargue },
      {
        name: ChargueServiceMock.updateChargueDto.name,
        description: ChargueServiceMock.updateChargueDto.description,
      },
    );
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('Validate update Error', async () => {
    const spyUpdateError = jest.spyOn(mockService, 'update').mockRejectedValueOnce(new Error());
    await expect(chargueService.update(ChargueServiceMock.updateChargueDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al actualizar el chargue',
      }),
    );
    expect(spyUpdateError).toBeCalled();
  });

  it('Validate update error no affected', async () => {
    const spyUpdateError = jest.spyOn(mockService, 'update').mockResolvedValueOnce({ affected: 0 });
    await expect(chargueService.update(ChargueServiceMock.updateChargueDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al actualizar el chargue',
      }),
    );
    expect(spyUpdateError).toBeCalled();
  });

  it('Validate remove OK', async () => {
    const spyDelete = jest.spyOn(mockService, 'delete');
    const { message } = await chargueService.remove(ChargueServiceMock.chargue.id);
    expect(message).toEqual(Constants.MSG_OK);
    expect(spyDelete).toBeCalledWith(ChargueServiceMock.chargue.id);
  });

  it('Validate remove Error', async () => {
    const spyDeleteError = jest.spyOn(mockService, 'delete').mockRejectedValueOnce(new Error());
    await expect(chargueService.remove(ChargueServiceMock.chargue.id)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al eliminar el chargue',
      }),
    );
    expect(spyDeleteError).toBeCalled();
  });
});
