import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { e2e_config } from '../e2e-config.spec';
import { Constants } from '../../src/common/constants/Constant';
import { LicenceModule } from '../../src/licence/licence.module';
import { Licence } from '../../src/licence/entities/licence.entity';
import { LicenceE2EMock } from './licence.mock.spec';

describe('LicenceController (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request: any;
  let licenceRepositoryMock: any;
  const { jwtToken } = e2e_config.env;
  const licenceId = 1;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, LicenceModule],
      providers: [{ provide: getRepositoryToken(Licence), useValue: licenceRepositoryMock }],
    }).compile();
    app = moduleFixture.createNestApplication();
    // Inicializamos nuestro validator de los DTO/Entities para validar las excepciones
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    ),
      await app.init();
    licenceRepositoryMock = moduleFixture.get(getRepositoryToken(Licence));

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

  it('/LICENCE  (POST) OK', async () => {
    const {
      body: { message },
    } = await request.post('/licence').send(LicenceE2EMock.createLicenceDto).expect(201);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/LICENCE (POST) ERROR [MOCK]', async () => {
    const spySaveError = jest
      .spyOn(licenceRepositoryMock, 'save')
      .mockRejectedValueOnce(new Error());

    await request.post('/licence').send(LicenceE2EMock.createLicenceDto).expect(500);
    expect(spySaveError).toBeCalled();
  });

  it('/LICENCE (GET) OK', async () => {
    const { body } = await request.get('/licence').expect(200);
    expect(body.length).toBeGreaterThanOrEqual(0);
  });

  it('/LICENCE (PATCH) OK', async () => {
    const {
      body: { message },
    } = await request.patch('/licence').send(LicenceE2EMock.updateLicenceDto).expect(200);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/LICENCE (PATCH) ERROR [MOCK]', async () => {
    const spyUpdateError = jest
      .spyOn(licenceRepositoryMock, 'update')
      .mockRejectedValueOnce(new Error());
    await request.patch('/licence').send(LicenceE2EMock.updateLicenceDto).expect(500);
    expect(spyUpdateError).toBeCalled();
  });

  it('/LICENCE (PATCH) ERROR NOT AFFECTED [MOCK]', async () => {
    const spyUpdateNotAffected = jest
      .spyOn(licenceRepositoryMock, 'update')
      .mockResolvedValueOnce({ affected: 0 });
    await request.patch('/licence').send(LicenceE2EMock.updateLicenceDto).expect(500);
    expect(spyUpdateNotAffected).toBeCalled();
  });

  it('/LICENCE (DELETE) OK', async () => {
    const {
      body: { message },
    } = await request.delete(`/licence/${licenceId}`).expect(200);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/LICENCE (DELETE) ERROR [MOCK]', async () => {
    const spyDeleteError = jest
      .spyOn(licenceRepositoryMock, 'delete')
      .mockRejectedValueOnce(new Error());
    await request.delete(`/licence/${licenceId}`).expect(500);
    expect(spyDeleteError).toBeCalled();
  });
});
