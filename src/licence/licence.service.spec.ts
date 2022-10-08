import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constants } from '../common/constants/Constant';
import { User } from '../user/entities/user.entity';
import { Licence } from './entities/licence.entity';
import { LicenceServiceMock } from './licence.mock.spec';
import { LicenceService } from './licence.service';

describe('LicenceService', () => {
  let licenceService: LicenceService;
  let mockService: LicenceServiceMock = new LicenceServiceMock();
  const { id } = LicenceServiceMock.licence;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicenceService,
        {
          provide: getRepositoryToken(Licence),
          useValue: mockService,
        },
      ],
    }).compile();
    licenceService = module.get<LicenceService>(LicenceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(licenceService).toBeDefined();
  });

  it('Validate create OK', async () => {
    const spyCreate = jest
      .spyOn(mockService, 'create')
      .mockReturnValueOnce(LicenceServiceMock.licence);
    const spySave = jest.spyOn(mockService, 'save');
    const { message } = await licenceService.create(LicenceServiceMock.createLicenceDto);
    expect(spyCreate).toBeCalledWith({
      codUser: LicenceServiceMock.createLicenceDto.codUser,
      description: LicenceServiceMock.createLicenceDto.description,
      dateInit: LicenceServiceMock.createLicenceDto.dateRange[0],
      dateEnd: LicenceServiceMock.createLicenceDto.dateRange[1],
    });
    expect(spySave).toBeCalledWith(LicenceServiceMock.licence);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('Validate create ERROR', async () => {
    const spyCreate = jest
      .spyOn(mockService, 'create')
      .mockReturnValueOnce(LicenceServiceMock.licence);
    const spySave = jest.spyOn(mockService, 'save').mockRejectedValueOnce(new Error());
    await expect(licenceService.create(LicenceServiceMock.createLicenceDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al registrar la licencia',
      }),
    );
    expect(spyCreate).toBeCalledWith({
      codUser: LicenceServiceMock.createLicenceDto.codUser,
      description: LicenceServiceMock.createLicenceDto.description,
      dateInit: LicenceServiceMock.createLicenceDto.dateRange[0],
      dateEnd: LicenceServiceMock.createLicenceDto.dateRange[1],
    });
    expect(spySave).toBeCalledWith(LicenceServiceMock.licence);
  });

  it('Validate findAll', async () => {
    const spyQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyAddSelect = jest.spyOn(mockService, 'addSelect');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyGetRawMany = jest.spyOn(mockService, 'getRawMany');

    await licenceService.findAll();
    expect(spyQueryBuilder).toBeCalledWith('LICENCE');
    expect(spySelect).toBeCalledWith('LICENCE.id', 'id');
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'LICENCE.codUser', 'codUser');
    expect(spyAddSelect).toHaveBeenNthCalledWith(2, 'LICENCE.description', 'description');
    expect(spyAddSelect).toHaveBeenNthCalledWith(3, 'LICENCE.dateInit', 'dateInit');
    expect(spyAddSelect).toHaveBeenNthCalledWith(4, 'LICENCE.dateEnd', 'dateEnd');
    expect(spyAddSelect).toHaveBeenNthCalledWith(
      5,
      'CONCAT (USER.name," ",USER.fatherLastName , " ",USER.motherLastName )',
      'fullName',
    );
    expect(spyInnerJoin).toBeCalledWith(User, 'USER', 'USER.id = LICENCE.codUser');
    expect(spyGetRawMany).toBeCalled();
  });

  it('Validate update OK', async () => {
    const spyCreate = jest.spyOn(mockService, 'create').mockReturnValue(LicenceServiceMock.licence);
    const spyUpdate = jest.spyOn(mockService, 'update').mockResolvedValueOnce({ affected: 1 });
    const { message } = await licenceService.update(LicenceServiceMock.updateLicenceDto);
    expect(spyCreate).toBeCalledWith({
      codUser: LicenceServiceMock.updateLicenceDto.codUser,
      description: LicenceServiceMock.updateLicenceDto.description,
      dateInit: LicenceServiceMock.updateLicenceDto.dateRange[0],
      dateEnd: LicenceServiceMock.updateLicenceDto.dateRange[1],
    });
    expect(spyUpdate).toBeCalledWith(
      { id: LicenceServiceMock.updateLicenceDto.id },
      LicenceServiceMock.licence,
    );
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('Validate update Error', async () => {
    const spyUpdateError = jest.spyOn(mockService, 'update').mockRejectedValueOnce(new Error());
    await expect(licenceService.update(LicenceServiceMock.updateLicenceDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al actualizar la licencia',
      }),
    );
    expect(spyUpdateError).toBeCalledTimes(1);
    // In case not update
    spyUpdateError.mockResolvedValueOnce({ affected: 0 });
    await expect(licenceService.update(LicenceServiceMock.updateLicenceDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al actualizar la licencia',
      }),
    );
    expect(spyUpdateError).toBeCalledTimes(2);
  });

  it('Validate remove OK', async () => {
    const spyDelete = jest.spyOn(mockService, 'delete');
    const { message } = await licenceService.remove(id);
    expect(message).toEqual(Constants.MSG_OK);
    expect(spyDelete).toBeCalledWith(id);
  });

  it('Validate remove Error', async () => {
    const spyDeleteError = jest.spyOn(mockService, 'delete').mockRejectedValueOnce(new Error());
    await expect(licenceService.remove(id)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al eliminar la licencia',
      }),
    );
    expect(spyDeleteError).toBeCalled();
  });
});
