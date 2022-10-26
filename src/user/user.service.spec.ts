import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { Chargue } from '../chargue/entities/chargue.entity';
import { Constants } from '../common/constants/Constant';
import { transporter } from '../config/mailer/mailer';
import { Schedule } from '../schedule/entities/schedule.entity';
import { User } from './entities/user.entity';
import { UserServiceMock } from './user.mock.spec';
import { UserService } from './user.service';
import * as Helpers from '../common/helpers';
describe('UserService', () => {
  let userService: UserService;
  let awsS3Service: AwsS3Service;
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
        {
          provide: AwsS3Service,
          useValue: mockService,
        },
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('Validate Create Ok', async () => {
    // Ahora validamos para el caso OK
    const spyFindByEmailMockOk = jest
      .spyOn(userService, 'findUserByEmail')
      .mockImplementationOnce(async () => UserServiceMock.mockResultOk);
    const spySave = jest.spyOn(mockService, 'save');
    const spyCreate = jest.spyOn(mockService, 'create').mockImplementationOnce(() => {
      return User;
    });
    // Mockeamos el envio de email
    const spyTransporterEmail = jest.spyOn(transporter, 'sendMail').mockReturnValue(null);

    const dataOK = await userService.create(UserServiceMock.mockCreateDto);
    // Validamos las llamadas a nuestras funciones mockeadas
    expect(spyFindByEmailMockOk).toBeCalledWith(UserServiceMock.mockCreateDto.username);
    expect(spyTransporterEmail).toBeCalled();
    expect(spyCreate).toBeCalledWith(UserServiceMock.mockCreateDto);
    expect(spySave).toBeCalledWith(User);
    // Validamos los datos de nuestro response
    expect(dataOK.user).toEqual(UserServiceMock.userMock);
    expect(dataOK.message).toEqual(Constants.MSG_OK);
  });

  it('Validate Create Error', async () => {
    // Espiamos y mockeamos findUserByEmail , se evaluara el caso donde es diferente de Constant.MENSAJE_OK
    const spyFindByEmailMockSomething = jest
      .spyOn(userService, 'findUserByEmail')
      .mockImplementation(async () => {
        return { message: 'SOMETHING' };
      });
    // Llamamos la funcion create de nuestro service
    const dataSomething = await userService.create(UserServiceMock.mockCreateDto);
    // Validamos que sea llamado spyFindByEmailMock
    expect(spyFindByEmailMockSomething).toBeCalledWith(UserServiceMock.mockCreateDto.username);
    // Validamos que la data devuelva sea el mockeo de nuestro spyFindByEmail
    expect(dataSomething).toEqual({ message: 'SOMETHING' });

    // Validamos el caso la funcion save de error
    const spyFindByEmailMockOk = jest
      .spyOn(userService, 'findUserByEmail')
      .mockImplementation(async () => UserServiceMock.mockResultOk);
    // Mockeamos la funciona save de mockService para que nos retorne error
    const mockSaveError = jest
      .spyOn(mockService, 'save')
      .mockRejectedValue(new Error('Sucedio un error'));
    // Validamos que sea llamado nuestro service create y tenga como respuestsa un InternalServerErrorException
    await expect(userService.create(UserServiceMock.mockCreateDto)).rejects.toThrowError(
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
    await expect(userService.create(UserServiceMock.mockCreateDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Hubo un error al enviar el correo de creacion',
      }),
    );
    // Validamos que se llame nuestra funcion mockTransporterEmailError
    expect(mockTransporterEmailError).toBeCalled();
  });

  it('Validate findByEmail OK', async () => {
    const { username } = UserServiceMock.mockCreateDto;
    // Validamos el primer caso donde findByEmail no retorne usuario , por cual retorna null , espiamos sus metodos del queryBuilder
    const spyQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spyGetOne = jest.spyOn(mockService, 'getOne');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyAddSelect = jest.spyOn(mockService, 'addSelect');
    // Realizamos el mockeo para que solo una vez nos retorne el valor null
    mockService.getOne.mockReturnValueOnce(false);
    // Llamamos nuestra funcion findByEmail y le paso el email fake
    const userNoExist = await userService.findUserByEmail(username);
    // Validamos que nuestros mocks fueran llamado
    expect(spyQueryBuilder).toHaveBeenNthCalledWith(1, 'user');
    expect(spyGetOne).toBeCalledTimes(1);
    expect(spyWhere).toHaveBeenNthCalledWith(1, {
      username,
    });
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'user.password');
    expect(userNoExist).toEqual({ message: Constants.MSG_OK });
    // Ahora validamos para el caso nos retorne un usuario
    mockService.getOne.mockReturnValueOnce(UserServiceMock.userMock);
    // Llamamos nuestra funcion findByEmail y le paso el email fake
    const userExist = await userService.findUserByEmail(username);
    // Validamos que nuestros espias fueran llamados en este caso por segunda vez
    expect(spyQueryBuilder).toHaveBeenNthCalledWith(2, 'user');
    expect(spyGetOne).toBeCalledTimes(2);
    expect(spyWhere).toHaveBeenNthCalledWith(2, {
      username,
    });
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'user.password');
    // Validamos las respuestas de nuestro servicio
    expect(userExist.user).toEqual(UserServiceMock.userMock);
    expect(userExist.message).toEqual('El correo del usuario ya existe');
  });

  it('Validate findByEmail Error', async () => {
    // Forzamos a getOne a que nos retorne un error para entrar en la exception de nuestro try catch
    mockService.getOne.mockRejectedValueOnce(new Error('Sucedio un error'));
    //Validamos el lanzamiento de nuestra excepcion InternalServerErrorException
    await expect(userService.findUserByEmail('errormail@example.mail.to')).rejects.toThrowError(
      new InternalServerErrorException({ message: 'Sucedio un error' }),
    );
  });

  it('Validate findAll', async () => {
    const spyQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyAddSelect = jest.spyOn(mockService, 'addSelect');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    //  const spyCache = jest.spyOn(mockService, 'cache');
    const spyGetRawMany = jest.spyOn(mockService, 'getRawMany');
    await userService.findAll();
    expect(spyQueryBuilder).toBeCalled();
    expect(spySelect).toBeCalled();
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'USER.username', 'username');
    expect(spyAddSelect).toHaveBeenNthCalledWith(2, 'USER.name', 'name');
    expect(spyAddSelect).toHaveBeenNthCalledWith(3, 'USER.fatherLastName', 'fatherLastName');
    expect(spyAddSelect).toHaveBeenNthCalledWith(4, 'USER.motherLastName', 'motherLastName');
    expect(spyAddSelect).toHaveBeenNthCalledWith(5, 'USER.createdAt', 'createdAt');
    expect(spyAddSelect).toHaveBeenNthCalledWith(6, 'USER.updateAt', 'updateAt');
    expect(spyAddSelect).toHaveBeenNthCalledWith(7, 'USER.status', 'status');
    expect(spyAddSelect).toHaveBeenNthCalledWith(8, 'USER.role', 'role');
    expect(spyAddSelect).toHaveBeenNthCalledWith(9, 'USER.photo', 'photo');
    expect(spyAddSelect).toHaveBeenNthCalledWith(10, 'USER.phone', 'phone');
    expect(spyAddSelect).toHaveBeenNthCalledWith(11, 'CHARGUE.id', 'codChargue');
    expect(spyAddSelect).toHaveBeenNthCalledWith(12, 'SCHEDULE.id', 'codSchedule');
    expect(spyAddSelect).toHaveBeenNthCalledWith(13, 'CHARGUE.name', 'chargue');
    expect(spyAddSelect).toHaveBeenNthCalledWith(14, 'SCHEDULE.name', 'schedule');
    expect(spyInnerJoin).toHaveBeenNthCalledWith(
      1,
      Chargue,
      'CHARGUE',
      'CHARGUE.id = USER.codChargue',
    );
    expect(spyInnerJoin).toHaveBeenNthCalledWith(
      2,
      Schedule,
      'SCHEDULE',
      'SCHEDULE.id = USER.codSchedule',
    );
    //    expect(spyCache).toBeCalledWith(1000);
    expect(spyGetRawMany).toBeCalled();
  });

  it('Validate Update Error', async () => {
    //Espiamos nuestro metodo getUserById
    const spyUpdateRepository = jest
      .spyOn(mockService, 'update')
      .mockRejectedValueOnce(new Error('Sucedio un error al actualizar al usuario'));
    // Llamamos nuestra funcion y validamos el error
    await expect(userService.update(UserServiceMock.updateUser)).rejects.toThrowError(
      new InternalServerErrorException({ message: 'Sucedio un error al actualizar al usuario' }),
    );
    //Validamos que nuestro espia fuera llamado
    expect(spyUpdateRepository).toBeCalled();
  });

  it('Validate Update Ok', async () => {
    // Hacemos que retorne un usuario mockeado con status creado
    const spyUpdateRepository = jest
      .spyOn(mockService, 'update')
      .mockImplementationOnce(async () => {
        UserServiceMock.userMock.firstLoginStatus();
      });
    const spyStatus = jest.spyOn(UserServiceMock.userMock, 'firstLoginStatus');
    const spyCreate = jest.spyOn(mockService, 'create').mockImplementationOnce(() => {
      return User;
    });
    // Llamamos nuestra funcion
    const userUpdateCreado = await userService.update(UserServiceMock.updateUser);
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

  it('Validate getUserById Ok', async () => {
    //Espiamos nuestro metodo findOneOrFail y hacemos que retorne el usuario
    const spyFindOneOrFail = jest
      .spyOn(mockService, 'findOneOrFail')
      .mockResolvedValue(UserServiceMock.userMock);
    // Llamamos la funcion mandado en su argumento el ID del usuario
    const userOk = await userService.getUserById(1);
    expect(spyFindOneOrFail).toBeCalledWith({
      where: { id: 1 },
    });
    expect(userOk).toEqual(UserServiceMock.userMock);
  });

  it('Validate getUserById Error', async () => {
    //Espiamos nuestro metodo findOneOrFail y hacemos que lance una excepcion
    const spyFindOneOrFail = jest
      .spyOn(mockService, 'findOneOrFail')
      .mockRejectedValue(new Error('Sucedio un error'));
    // Llamamos nuestra funcion y la evaluamos que lance el error corespondiente
    expect(userService.getUserById(1)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al buscar el usuario',
      }),
    );
    // Validamos la llamada de nuestro espia
    expect(spyFindOneOrFail).toBeCalled();
  });

  it('Validate Remove Error', async () => {
    // Mockeamos la funcion delete para validar
    const spyDeleteError = jest
      .spyOn(mockService, 'delete')
      .mockRejectedValue(new Error('Sucedio un error'));

    await expect(userService.remove(UserServiceMock.deleteUser)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al eliminar al usuario',
      }),
    );
    // Validamos la llamada del espia delete Error
    expect(spyDeleteError).toBeCalled();
  });

  it('Validate Remove OK', async () => {
    // Mockeamos la funcion delete para validar
    const spyDeleteOk = jest.spyOn(mockService, 'delete').mockResolvedValue(null);
    const data = await userService.remove(UserServiceMock.deleteUser);
    expect(spyDeleteOk).toBeCalledWith(UserServiceMock.deleteUser.id);
    expect(data.message).toEqual(Constants.MSG_OK);
  });

  it('Validate saveNewPassword OK', async () => {
    const { username, password, firstLogin, status } = UserServiceMock.userMock;
    const spyUserHashPassword = jest.spyOn(UserServiceMock.userMock, 'hashPassword');
    const spyCreate = jest.spyOn(mockService, 'create').mockImplementation(() => {
      return UserServiceMock.userMock;
    });
    const spyUpdate = jest.spyOn(mockService, 'update');
    const spySet = jest.spyOn(mockService, 'set');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyExecuteQueryBuilderAffected = jest
      .spyOn(mockService, 'execute')
      .mockResolvedValueOnce({ affected: 1 });
    const savePasswordAffect = await userService.saveNewPassword(UserServiceMock.userMock);
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
  });

  it('Validate saveNewPassword Not Affected', async () => {
    const spyExecuteQueryBuilderNotAffected = jest
      .spyOn(mockService, 'execute')
      .mockResolvedValueOnce({
        affected: 0,
      });

    await expect(userService.saveNewPassword(UserServiceMock.userMock)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al cambiar la contraseña',
      }),
    );
    expect(spyExecuteQueryBuilderNotAffected).toBeCalled();
  });

  it('Validate saveNewPassword Error', async () => {
    const spyCreate = jest.spyOn(mockService, 'create').mockImplementation(() => {
      return UserServiceMock.userMock;
    });
    const spyExecuteQueryBuilderError = jest
      .spyOn(mockService, 'execute')
      .mockRejectedValue(new Error('Algo salio mal'));
    await expect(userService.saveNewPassword(UserServiceMock.userMock)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al cambiar la contraseña',
      }),
    );
    expect(spyExecuteQueryBuilderError).toBeCalled();
    expect(spyCreate).toBeCalled();
  });

  it('Validate savePhotoUser Ok', async () => {
    const spyFileNamer = jest.spyOn(Helpers, 'fileNamer').mockReturnValueOnce(null);
    const spyUploadFile = jest
      .spyOn(awsS3Service, 'uploadFile')
      .mockResolvedValueOnce({ Location: 'www.awsS3.com/skyzerozx.jpg' });
    const spyUpdate = jest.spyOn(mockService, 'update');
    await userService.savePhotoUser(UserServiceMock.mockFile, UserServiceMock.userMock);
    expect(spyUploadFile).toBeCalledWith(UserServiceMock.mockFile.buffer, null);
    expect(spyFileNamer).toBeCalledWith(
      UserServiceMock.mockFile,
      UserServiceMock.userMock.username,
    );
    expect(spyUpdate).toBeCalledWith(
      { id: UserServiceMock.userMock.id },
      { photo: 'www.awsS3.com/skyzerozx.jpg' },
    );
  });

  it('Validate savePhotoUser Error', async () => {
    await expect(
      userService.savePhotoUser(UserServiceMock.mockFile, UserServiceMock.userMock),
    ).rejects.toThrowError(new InternalServerErrorException('Sucedio un error al subir su foto'));
    //  expect(spyUploadFileError).toBeCalled();
  });
});
