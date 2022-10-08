import { Test, TestingModule } from '@nestjs/testing';
import { LicenceController } from './licence.controller';
import { LicenceServiceMock } from './licence.mock.spec';
import { LicenceService } from './licence.service';

describe('LicenceController', () => {
  let licenceController: LicenceController;
  let licenceService: LicenceService;
  let mockService: LicenceServiceMock = new LicenceServiceMock();
  const { id } = LicenceServiceMock.licence;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LicenceController],
      providers: [{ provide: LicenceService, useValue: mockService }],
    }).compile();

    licenceController = module.get<LicenceController>(LicenceController);
    licenceService = module.get<LicenceService>(LicenceService);
  });

  it('should be defined', () => {
    expect(licenceController).toBeDefined();
  });

  it('Validate create', async () => {
    const spyCreate = jest.spyOn(mockService, 'create');
    await licenceController.create(LicenceServiceMock.createLicenceDto);
    expect(spyCreate).toBeCalledWith(LicenceServiceMock.createLicenceDto);
  });

  it('Validate findAll ', async () => {
    const spyFindAll = jest.spyOn(mockService, 'findAll');
    await licenceController.findAll();
    expect(spyFindAll).toBeCalled();
  });

  it('Validate update', async () => {
    const spyUpdate = jest.spyOn(mockService, 'update');
    await licenceController.update(LicenceServiceMock.updateLicenceDto);
    expect(spyUpdate).toBeCalledWith(LicenceServiceMock.updateLicenceDto);
  });

  it('Validate remove', async () => {
    const spyRemove = jest.spyOn(mockService, 'remove');
    await licenceController.remove(id);
    expect(spyRemove).toBeCalledWith(id);
  });
});
