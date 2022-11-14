import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { e2e_config } from '../e2e-config.spec';
import { Constants } from '../../src/common/constants/Constant';
import { ChargueModule } from '../../src/chargue/chargue.module';
import { ChargueMockE2E } from './chargue.mock.spec';
import { Chargue } from '../../src/chargue/entities/chargue.entity';

describe('ChargueController (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request: any;
  let chargueRepositoryMock: any;
  const { jwtToken } = e2e_config.env;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ChargueModule],
      providers: [{ provide: getRepositoryToken(Chargue), useValue: chargueRepositoryMock }],
    }).compile();
    app = moduleFixture.createNestApplication();
    // Inicializamos nuestro validator de los DTO/Entities para validar las excepciones
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    ),
      await app.init();
    chargueRepositoryMock = moduleFixture.get(getRepositoryToken(Chargue));

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

  it('/CHARGUE  (POST) OK', async () => {
    const { createChargueDto } = new ChargueMockE2E();
    const { body } = await request.post('/chargue').send(createChargueDto).expect(201);

    expect(body.message).toEqual(Constants.MSG_OK);
  });

  it('/CHARGUE (POST) ERROR [MOCK]', async () => {
    const { createChargueDto } = new ChargueMockE2E();
    const spySaveError = jest
      .spyOn(chargueRepositoryMock, 'save')
      .mockRejectedValueOnce(new Error());
    await request.post('/chargue').send(createChargueDto).expect(500);

    expect(spySaveError).toBeCalled();
  });

  it('/CHARGUE (GET) OK', async () => {
    const { body } = await request.get('/chargue').expect(200);
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  it('/CHARGUE (PATCH) OK ', async () => {
    const {
      body: { message },
    } = await request.patch('/chargue').send(ChargueMockE2E.updateChargueDto).expect(200);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/CHARGUE (PATCH) ERROR [MOCK]', async () => {
    const spyUpdateError = jest
      .spyOn(chargueRepositoryMock, 'update')
      .mockRejectedValueOnce(new Error());
    await request.patch('/chargue').send(ChargueMockE2E.updateChargueDto).expect(500);
    expect(spyUpdateError).toBeCalled();
  });

  it('/CHARGUE (DELETE) OK ', async () => {
    const {
      body: { message },
    } = await request.delete(`/chargue/999`).expect(200);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/CHARGUE (PATCH) NOT AFFECTED ERROR [MOCK]', async () => {
    const spyUpdateNotAffect = jest
      .spyOn(chargueRepositoryMock, 'update')
      .mockResolvedValueOnce({ affected: 0 });
    await request.patch('/chargue').send(ChargueMockE2E.updateChargueDto).expect(500);
    expect(spyUpdateNotAffect).toBeCalled();
  });

  it('/CHARGUE (DELETE) ERROR [MOCK]', async () => {
    const id = 999;
    const spyDeleteError = jest
      .spyOn(chargueRepositoryMock, 'delete')
      .mockRejectedValueOnce(new Error());
    await request.delete(`/chargue/${id}`).expect(500);
    expect(spyDeleteError).toBeCalledWith(id);
  });
});
