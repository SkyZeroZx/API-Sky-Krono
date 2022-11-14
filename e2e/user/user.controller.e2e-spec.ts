import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constants } from '../../src/common/constants/Constant';
import { UserModule } from '../../src/user/user.module';
import { User } from '../../src/user/entities/user.entity';
import { UserMockE2E } from './user.mock.e2e.spec';
import { transporter } from '../../src/config/mailer/mailer';
import { e2e_config } from '../e2e-config.spec';

const mockUploadInstance = {
  upload: jest.fn().mockReturnThis(),
  done: jest.fn(),
  promise: jest.fn(),
};

jest.mock('@aws-sdk/lib-storage', () => {
  return { Upload: jest.fn(() => mockUploadInstance) };
});

import webPush from '../../src/config/webpush/webpush';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request: any;
  // let userServiceMock: UserService;
  let userRepositoryMock: any;
  const {
    jwtToken,
    users: { userLoginOk, userReset, userCreate, userBloq },
  } = e2e_config.env;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UserModule],
      providers: [
        //   { provide: UserService, useValue: userServiceMock },
        { provide: getRepositoryToken(User), useValue: userRepositoryMock },
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    // Inicializamos nuestro validator de los DTO/Entities para validar las excepciones
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    // notificacionServiceMock = moduleFixture.get<NotificacionService>(NotificacionService);
    userRepositoryMock = moduleFixture.get(getRepositoryToken(User));
    //  userServiceMock = moduleFixture.get<UserService>(UserService);
    // Inc]ializamos las push notification
    webPush();
    // Configuramos nuestro superTest con la ruta base y nuestro token para peticiones
    request = superTest.agent(app.getHttpServer()).set(jwtToken);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  // Al finalizar todos nuevos test cerramos las conexiones para evitar memory leaks
  afterAll(async () => {
    await app.close();
  });

  it('/USER (POST) OK', async () => {
    //Registramos un usuario fake
    const userRegister = new UserMockE2E();
    const {
      body: { message },
    } = await request.post('/users').send(userRegister.createUserNew);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/USER (POST) ERROR', async () => {
    //Intentamos registrar un usuario ya existe por lo cual tendremos un error
    const { body } = await request.post('/users').send(UserMockE2E.createUserExist).expect(400);
    expect(body.message).toEqual('El correo del usuario ya existe');

    // Validamos para el caso que tengamos un error en base de datos al buscar al usuario para ello mockeamos
    const spyErrorCreateQueryBuilder = jest
      .spyOn(userRepositoryMock, 'createQueryBuilder')
      .mockImplementationOnce(async () => {
        new Error('Error Base Datos Query');
      });
    const registerUserErrorCreateQueryBuilder = await request
      .post('/users')
      .send(UserMockE2E.createUserExist);
    expect(registerUserErrorCreateQueryBuilder.body.message).toEqual('Sucedio un error');
    expect(spyErrorCreateQueryBuilder).toBeCalled();

    //Validamos para el caso que al registrar el usuario tengamos error de base de datos para ello mockeamos
    const newUserSaveError = new UserMockE2E();
    const spyErrorSave = jest
      .spyOn(userRepositoryMock, 'save')
      .mockRejectedValueOnce(new Error('Error Save'));
    const registerUserErrorSave = await request
      .post('/users')
      .send(newUserSaveError.createUserNew)
      .expect(500);
    expect(registerUserErrorSave.body.message).toEqual('Sucedio un error al crear al usuario');
    expect(spyErrorSave).toBeCalled();

    // Validamos para el caso que el servidor de correos nos de un error para ello mockeamos
    const newUserEmailError = new UserMockE2E();

    const spyMailError = jest
      .spyOn(transporter, 'sendMail')
      .mockRejectedValueOnce(new Error('Error Mail Mock'));
    const registerUserErrorMail = await request
      .post('/users')
      .send(newUserEmailError.createUserNew)
      .expect(500);
    expect(spyMailError).toBeCalled();
    expect(registerUserErrorMail.body.message).toEqual(
      'Hubo un error al enviar el correo de creacion',
    );
  });

  it('/USER (GET) OK', async () => {
    const getUsersOk = await request.get('/users').expect(200);
    expect(getUsersOk.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/PROFILE (GET) OK', async () => {
    const { password, updateAt, ...expectUserLogin } = userLoginOk;
    const {
      body: { updateAt: responseUpdateAt, ...rest },
    } = await request.get('/users/profile').expect(200);

    expect(rest).toEqual(expectUserLogin);
  });

  it('/PROFILE (GET) ERROR [MOCK]', async () => {
    const spyUserFindOneOrFail = jest
      .spyOn(userRepositoryMock, 'findOneOrFail')
      .mockRejectedValueOnce(new Error('Error DataBase'));
    const profileError = await request.get('/users/profile').expect(500);
    expect(profileError.body.message).toEqual('Sucedio un error al buscar el usuario');
    expect(spyUserFindOneOrFail).toBeCalled();
  });

  it('/UPDATE (PATCH) OK', async () => {
    const {
      body: { message },
    } = await request.patch('/users').send(UserMockE2E.updateUserExist).expect(200);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/UPDATE (PATCH) ERROR [MOCK]', async () => {
    const spyUpdateError = jest
      .spyOn(userRepositoryMock, 'update')
      .mockRejectedValueOnce(new Error('Error DataBase'));
    const updateError = await request.patch('/users').send(UserMockE2E.updateUserExist).expect(500);

    expect(updateError.body.message).toEqual('Sucedio un error al actualizar al usuario');
    expect(spyUpdateError).toBeCalled();
  });

  it('/ (DELETE) OK [MOCK]', async () => {
    const spyDeleteOK = jest.spyOn(userRepositoryMock, 'delete').mockResolvedValueOnce(null);
    const deleteOK = await request.delete(`/users/${UserMockE2E.deleteUserDto.id}`).expect(200);
    expect(deleteOK.body.message).toEqual(Constants.MSG_OK);
    expect(spyDeleteOK).toBeCalled();
  });

  it('/ (DELETE) ERROR [MOCK]', async () => {
    const spyDeleteError = jest
      .spyOn(userRepositoryMock, 'delete')
      .mockRejectedValueOnce(new Error('Error DELETE'));
    const deleteError = await request.delete(`/users/${UserMockE2E.deleteUserDto.id}`).expect(500);
    expect(deleteError.body.message).toEqual('Sucedio un error al eliminar al usuario');
    expect(spyDeleteError).toBeCalled();
  });

  it('/PHOTO (POST) OK', async () => {
    const {
      body: { message },
    } = await request.post('/users/photo').attach('file', e2e_config.env.pathPhoto).expect(201);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/PHOTO (POST) ERROR [MOCK]', async () => {
    mockUploadInstance.done.mockImplementationOnce(() => {
      throw new Error();
    });
    await request.post('/users/photo').attach('file', e2e_config.env.pathPhoto).expect(500);
  });
});
