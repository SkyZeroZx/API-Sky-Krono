import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constants } from '../common/constants/Constant';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UserServiceMock } from './user.mock.spec';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  const mockFindAllUserVoid: User[] = [];

  const mockResult: any = {
    message: Constants.MSG_OK,
  };
  const mockCreateDto: CreateUserDto = {
    username: 'SkyZeroZx',
    name: 'Jaime',
    motherLastName: 'Burgos',
    fatherLastName: 'Tejada',
    role: 'Admin',
    codChargue: 0,
    codSchedule: 0,
  };
  const mockUpdateDto: UpdateUserDto = {
    id: 555,
    status: 'RESETEADO',
  };
  const mockRemoveDto: DeleteUserDto = {
    id: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Validamos create', async () => {
    // Espiamos nuestros servicios de userService y lo mockeamos para tener una respuesta satisfactoria
    const spyCreate = jest.spyOn(service, 'create').mockImplementation(() => mockResult);
    // Llamamos nuestra funcion create del controller y le pasamos nuestro mockCreateDto
    await controller.create(mockCreateDto);
    // Validamos que llame a create
    expect(spyCreate).toBeCalled();
    // Llamamos a nuestro metodo create del controller
    //   const createController = await controller.create(testCreateDto);
    /*  await expect( controller.create(testCreateDto)) .rejects
    .toEqual(new BadRequestException({message : "Sucedio un error"}));*/
  });

  it('Validamos findAll', async () => {
    // Espiamos nuestra funcion spyFindAll del servicio usuario
    const spyFindAllVoid = jest
      .spyOn(service, 'findAll')
      .mockImplementation(async () => mockFindAllUserVoid);
    // Llamamos nuestra funcion findAll del controller
    const dataVoid = await controller.findAll();
    // Validamos que fuera llamado FindAll
    expect(spyFindAllVoid).toBeCalled();
    // Validamos el mensaje para el caso que no retorne usuarios
    expect(dataVoid).toEqual({ message: 'No users found' });

    // Ahora mockeamos un servicio con data
    const spyFindAllData = jest
      .spyOn(service, 'findAll')
      .mockImplementation(async () => UserServiceMock.mockFindAllUserData);
    // Llamamos nuestra funcion findAll del controller
    const data = await controller.findAll();
    // Validamos que fuera llamado FindAll
    expect(spyFindAllData).toBeCalled();
    // Validamos que la data devuelva sea nuestro servicio mockeado
    expect(data).toEqual(UserServiceMock.mockFindAllUserData);
  });

  it('Validamos Update', async () => {
    //Espiamos nuestra funcion update del servicio usuario
    const spyUpdate = jest.spyOn(service, 'update').mockImplementation(async () => mockResult);
    // Llamamos nuestra funcion update del controller
    await controller.update(mockUpdateDto);
    // Validamos que sea llamado el servicio update en el controller
    expect(spyUpdate).toBeCalled();
  });

  it('Validamos Delete', async () => {
    // Espiamos nuestra funcion remove del servicio usuario
    const spyRemove = jest.spyOn(service, 'remove').mockImplementation(async () => mockResult);
    // Llamamos nuestra funcion remove
    await controller.remove(mockRemoveDto);
    // Validamos que se llame a remove
    expect(spyRemove).toBeCalled();
  });

  it('Validamos Profile', async () => {
    const userProfile = UserServiceMock.mockFindAllUserData[0];
    const spyProfileService = jest.spyOn(service, 'getUserById').mockResolvedValue(userProfile);
    const profile = await controller.profile(UserServiceMock.mockResultCreateUser);
    expect(profile).toEqual(userProfile);
    expect(spyProfileService).toBeCalledWith(UserServiceMock.mockResultCreateUser.id);
  });
});
