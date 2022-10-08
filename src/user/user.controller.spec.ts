import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Constants } from '../common/constants/Constant';
import { UserServiceMock } from './user.mock.spec';
import * as filterHelperUtil from '../common/helpers/fileFilter.helper';
describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  const mockResult: any = {
    message: Constants.MSG_OK,
  };
  let mockService: UserServiceMock = new UserServiceMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockService }],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('Validamos create', async () => {
    const spyCreate = jest.spyOn(userService, 'create').mockImplementation(() => mockResult);
    await userController.create(UserServiceMock.mockCreateDto);
    expect(spyCreate).toBeCalled();
  });

  it('Validamos findAll', async () => {
    const spyFindAll = jest.spyOn(userService, 'findAll');
    await userController.findAll();
    expect(spyFindAll).toBeCalled();
  });

  it('Validamos Update', async () => {
    const spyUpdate = jest.spyOn(userService, 'update').mockImplementation(async () => mockResult);
    await userController.update(UserServiceMock.updateUser);
    expect(spyUpdate).toBeCalled();
  });

  it('Validamos Delete', async () => {
    const spyRemove = jest.spyOn(userService, 'remove').mockImplementation(async () => mockResult);
    await userController.remove(UserServiceMock.deleteUser);
    expect(spyRemove).toBeCalled();
  });

  it('Validamos Profile', async () => {
    const userProfile = UserServiceMock.mockFindAllUserData[0];
    const spyProfileService = jest.spyOn(userService, 'getUserById').mockResolvedValue(userProfile);
    const profile = await userController.profile(UserServiceMock.userMock);
    expect(profile).toEqual(userProfile);
    expect(spyProfileService).toBeCalledWith(UserServiceMock.userMock.id);
  });

  it('Validate SavePhotoUser', async () => {
    const spyMaxSizeFile = jest.spyOn(filterHelperUtil, 'maxSizeFile').mockReturnValueOnce(null);
    const spySavePhotoUser = jest.spyOn(userService, 'savePhotoUser');
    await userController.savePhotoUser(null, UserServiceMock.userMock);
    expect(spyMaxSizeFile).toBeCalledWith(null);
    expect(spySavePhotoUser).toBeCalledWith(null, UserServiceMock.userMock);
  });
});
