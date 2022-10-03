import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constants } from '../common/constants/Constant';
import { transporter } from '../config/mailer/mailer';

import { User } from './entities/user.entity';
import { UserServiceMock } from './user.mock.spec';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  // Instanciamos nuestro userServiceMock
  let mockService: UserServiceMock = new UserServiceMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockService,
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Service debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('Validamos Create Ok', async () => {
    // Ahora validamos para el caso OK
    const spyFindByEmailMockOk = jest
      .spyOn(service, 'findByEmail')
      .mockImplementationOnce(async () => UserServiceMock.mockResultOk);
    const spySave = jest.spyOn(mockService, 'save');
    const spyCreate = jest.spyOn(mockService, 'create').mockImplementationOnce(() => {
      return User;
    });
    // Mockeamos el envio de email
    const spyTransporterEmail = jest.spyOn(transporter, 'sendMail').mockReturnValue(null);

    const dataOK = await service.create(UserServiceMock.mockCreateDto);
    // Validamos las llamadas a nuestras funciones mockeadas
    expect(spyFindByEmailMockOk).toBeCalledWith(UserServiceMock.mockCreateDto.username);
    expect(spyTransporterEmail).toBeCalled();
    expect(spyCreate).toBeCalledWith(UserServiceMock.mockCreateDto);
    expect(spySave).toBeCalledWith(User);
    // Validamos los datos de nuestro response
    expect(dataOK.user).toEqual(UserServiceMock.mockResultCreateUser);
    expect(dataOK.message).toEqual(Constants.MSG_OK);
  });

  it('Validamos Create Error', async () => {
    // Espiamos y mockeamos findByEmail , se evaluara el caso donde es diferente de Constant.MENSAJE_OK
    const spyFindByEmailMockSomething = jest
      .spyOn(service, 'findByEmail')
      .mockImplementation(async () => {
        return { message: 'SOMETHING' };
      });
    // Llamamos la funcion create de nuestro service
    const dataSomething = await service.create(UserServiceMock.mockCreateDto);
    // Validamos que sea llamado spyFindByEmailMock
    expect(spyFindByEmailMockSomething).toBeCalledWith(UserServiceMock.mockCreateDto.username);
    // Validamos que la data devuelva sea el mockeo de nuestro spyFindByEmail
    expect(dataSomething).toEqual({ message: 'SOMETHING' });

    // Validamos el caso la funcion save de error
    const spyFindByEmailMockOk = jest
      .spyOn(service, 'findByEmail')
      .mockImplementation(async () => UserServiceMock.mockResultOk);
    // Mockeamos la funciona save de mockService para que nos retorne error
    const mockSaveError = jest
      .spyOn(mockService, 'save')
      .mockRejectedValue(new Error('Sucedio un error'));
    // Validamos que sea llamado nuestro service create y tenga como respuestsa un InternalServerErrorException
    await expect(service.create(UserServiceMock.mockCreateDto)).rejects.toThrowError(
      new InternalServerErrorException({ message: 'Sucedio un error al crear al usuario' }),
    );
    // Validamos que nuestra funciona save mockeada fuera llamada
    expect(mockSaveError).toBeCalled();
    // Validamos que fuera llamado nuestro spyFindByEmailMockOk
    expect(spyFindByEmailMockOk).toBeCalledWith(UserServiceMock.mockCreateDto.username);
    // Validamos el caso que transport el servicio que envia correo de creacion nos de un error
    // Previamente RESETEAMOS  el mock de saveError
    mockSaveError.mockReset();
    // Mockeamos el envio de email
    const mockTransporterEmailError = jest
      .spyOn(transporter, 'sendMail')
      .mockRejectedValue(new Error('Error al enviar email'));
    // Validamos que fuera llamada
    await expect(service.create(UserServiceMock.mockCreateDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Hubo un error al enviar el correo de creacion',
      }),
    );
    // Validamos que se llame nuestra funcion mockTransporterEmailError
    expect(mockTransporterEmailError).toBeCalled();
  });

  it('Validamos findByEmail OK', async () => {
    const { username } = UserServiceMock.mockCreateDto;
    // Validamos el primer caso donde findByEmail no retorne usuario , por cual retorna null , espiamos sus metodos del queryBuilder
    const spyQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spyGetOne = jest.spyOn(mockService, 'getOne');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyAddSelect = jest.spyOn(mockService, 'addSelect');
    // Realizamos el mockeo para que solo una vez nos retorne el valor null
    mockService.getOne.mockReturnValueOnce(false);
    // Llamamos nuestra funcion findByEmail y le paso el email fake
    const userNoExist = await service.findByEmail(username);
    // Validamos que nuestros mocks fueran llamado
    expect(spyQueryBuilder).toHaveBeenNthCalledWith(1, 'user');
    expect(spyGetOne).toBeCalledTimes(1);
    expect(spyWhere).toHaveBeenNthCalledWith(1, {
      username,
    });
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'user.password');
    expect(userNoExist).toEqual({ message: Constants.MSG_OK });
    // Ahora validamos para el caso nos retorne un usuario
    mockService.getOne.mockReturnValueOnce(UserServiceMock.mockResultCreateUser);
    // Llamamos nuestra funcion findByEmail y le paso el email fake
    const userExist = await service.findByEmail(username);
    // Validamos que nuestros espias fueran llamados en este caso por segunda vez
    expect(spyQueryBuilder).toHaveBeenNthCalledWith(2, 'user');
    expect(spyGetOne).toBeCalledTimes(2);
    expect(spyWhere).toHaveBeenNthCalledWith(2, {
      username,
    });
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'user.password');
    // Validamos las respuestas de nuestro servicio
    expect(userExist.user).toEqual(UserServiceMock.mockResultCreateUser);
    expect(userExist.message).toEqual('El correo del usuario ya existe');
  });

  it('Validamos findByEmail Error', async () => {
    // Forzamos a getOne a que nos retorne un error para entrar en la exception de nuestro try catch
    mockService.getOne.mockRejectedValueOnce(new Error('Sucedio un error'));
    //Validamos el lanzamiento de nuestra excepcion InternalServerErrorException
    await expect(service.findByEmail('errormail@example.mail.to')).rejects.toThrowError(
      new InternalServerErrorException({ message: 'Sucedio un error' }),
    );
  });

  it('Validamos findAll', async () => {
    //Espiamos la funcion find
    const spyFind = jest.spyOn(mockService, 'find');
    //Mockeamos el retorno de find de userRepository
    mockService.find.mockReturnValueOnce(UserServiceMock.mockFindAllUserData);
    //Llamamos nuestra funcion a evaluar
    const dataUsers = await service.findAll();
    // Validamos que nuestro mock fuera llamada
    expect(spyFind).toBeCalled();
    // validamos el valor retornado
    expect(dataUsers).toEqual(UserServiceMock.mockFindAllUserData);
  });

  it('Validamos Update Error', async () => {
    //Espiamos nuestro metodo getUserById
    const spyUpdateRepository = jest
      .spyOn(mockService, 'update')
      .mockRejectedValueOnce(new Error('Sucedio un error al actualizar al usuario'));
    // Llamamos nuestra funcion y validamos el error
    await expect(service.update(UserServiceMock.updateUser)).rejects.toThrowError(
      new InternalServerErrorException({ message: 'Sucedio un error al actualizar al usuario' }),
    );
    //Validamos que nuestro espia fuera llamado
    expect(spyUpdateRepository).toBeCalled();
  });

  it('Validamos Update Ok', async () => {
    // Hacemos que retorne un usuario mockeado con status creado
    const spyUpdateRepository = jest
      .spyOn(mockService, 'update')
      .mockImplementationOnce(async () => {
        UserServiceMock.mockResultCreateUser.firstLoginStatus();
      });
    const spyStatus = jest.spyOn(UserServiceMock.mockResultCreateUser, 'firstLoginStatus');
    const spyCreate = jest.spyOn(mockService, 'create').mockImplementationOnce(() => {
      return User;
    });
    // Llamamos nuestra funcion
    const userUpdateCreado = await service.update(UserServiceMock.updateUser);
    //Validamos que nuestro espia fuera llamado
    expect(spyUpdateRepository).toBeCalledWith(UserServiceMock.updateUser.id, User);
    expect(spyStatus).toBeCalled();
    expect(spyCreate).toBeCalledWith({
      name: UserServiceMock.updateUser.name,
      motherLastName: UserServiceMock.updateUser.motherLastName,
      fatherLastName: UserServiceMock.updateUser.fatherLastName,
      role: UserServiceMock.updateUser.role,
      status: UserServiceMock.updateUser.status,
    });
    expect(userUpdateCreado.message).toEqual(Constants.MSG_OK);
  });

  it('Validamos getUserById Ok', async () => {
    //Espiamos nuestro metodo findOneOrFail y hacemos que retorne el usuario
    const spyFindOneOrFail = jest
      .spyOn(mockService, 'findOneOrFail')
      .mockResolvedValue(UserServiceMock.mockResultCreateUser);
    // Llamamos la funcion mandado en su argumento el ID del usuario
    const userOk = await service.getUserById(1);
    expect(spyFindOneOrFail).toBeCalledWith({
      where: { id: 1 },
    });
    expect(userOk).toEqual(UserServiceMock.mockResultCreateUser);
  });

  it('Validamos getUserById Error', async () => {
    //Espiamos nuestro metodo findOneOrFail y hacemos que lance una excepcion
    const spyFindOneOrFail = jest
      .spyOn(mockService, 'findOneOrFail')
      .mockRejectedValue(new Error('Sucedio un error'));
    // Llamamos nuestra funcion y la evaluamos que lance el error corespondiente
    expect(service.getUserById(1)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al buscar el usuario',
      }),
    );
    // Validamos la llamada de nuestro espia
    expect(spyFindOneOrFail).toBeCalled();
  });

  it('Validamos Remove Error', async () => {
    // Mockeamos la funcion delete para validar
    const spyDeleteError = jest
      .spyOn(mockService, 'delete')
      .mockRejectedValue(new Error('Sucedio un error'));

    await expect(service.remove(UserServiceMock.deleteUser)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al eliminar al usuario',
      }),
    );
    // Validamos la llamada del espia delete Error
    expect(spyDeleteError).toBeCalled();
  });

  it('Validamos Remove OK', async () => {
    // Mockeamos la funcion delete para validar
    const spyDeleteOk = jest.spyOn(mockService, 'delete').mockResolvedValue(null);
    const data = await service.remove(UserServiceMock.deleteUser);
    expect(spyDeleteOk).toBeCalledWith(UserServiceMock.deleteUser.id);
    expect(data.message).toEqual(Constants.MSG_OK);
  });

  it('Validamos saveNewPassword OK', async () => {
    const { username, password, firstLogin, status } = UserServiceMock.mockResultCreateUser;
    const spyUserHashPassword = jest.spyOn(UserServiceMock.mockResultCreateUser, 'hashPassword');
    const spyCreate = jest.spyOn(mockService, 'create').mockImplementation(() => {
      return UserServiceMock.mockResultCreateUser;
    });
    const spyUpdate = jest.spyOn(mockService, 'update');
    const spySet = jest.spyOn(mockService, 'set');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyExecuteQueryBuilderAffected = jest
      .spyOn(mockService, 'execute')
      .mockResolvedValueOnce({ affected: 1 });
    const savePasswordAffect = await service.saveNewPassword(UserServiceMock.mockResultCreateUser);
    //Validamos la primera condicion cuando es afectado la actualizacion
    expect(spyUserHashPassword).toBeCalled();
    expect(spyCreate).toBeCalled();
    expect(spyUpdate).toBeCalledWith(User);
    expect(spySet).toBeCalledWith({
      firstLogin,
      password,
      status,
    });
    expect(spyWhere).toBeCalledWith('username = :username', { username });
    expect(spyExecuteQueryBuilderAffected).toBeCalled();
    expect(savePasswordAffect.message).toEqual(Constants.MSG_OK);
    // Validamos para el caso que es diferente de 1 es decir no fue afectado
    const spyExecuteQueryBuilderNotAffected = spyExecuteQueryBuilderAffected.mockResolvedValueOnce({
      affected: 0,
    });
    const savePasswordNotAffected = await service.saveNewPassword(
      UserServiceMock.mockResultCreateUser,
    );
    expect(savePasswordNotAffected.message).toEqual('Sucedio un error al cambiar la contraseña');
    expect(spyExecuteQueryBuilderNotAffected).toBeCalled();
  });

  it('Validamos saveNewPassword Error', async () => {
    const spyCreate = jest.spyOn(mockService, 'create').mockImplementation(() => {
      return UserServiceMock.mockResultCreateUser;
    });
    const spyExecuteQueryBuilderError = jest
      .spyOn(mockService, 'execute')
      .mockRejectedValue(new Error('Algo salio mal'));
    await expect(
      service.saveNewPassword(UserServiceMock.mockResultCreateUser),
    ).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al cambiar la contraseña',
      }),
    );
    expect(spyExecuteQueryBuilderError).toBeCalled();
    expect(spyCreate).toBeCalled();
  });
});
