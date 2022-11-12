import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeModule } from '../../src/type/type.module';
import { Type } from '../../src/type/entities/type.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { e2e_config } from '../e2e-config.spec';
import { TypeE2EMock } from './type.mock.spec';
import { Constants } from '../../src/common/constants/Constant';

describe('TypeController (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request: any;
  let typeRepositoryMock: any;
  const {
    jwtToken,
    types: { updateType },
  } = e2e_config.env;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeModule],
      providers: [{ provide: getRepositoryToken(Type), useValue: typeRepositoryMock }],
    }).compile();
    app = moduleFixture.createNestApplication();
    // Inicializamos nuestro validator de los DTO/Entities para validar las excepciones
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    ),
      await app.init();
    typeRepositoryMock = moduleFixture.get(getRepositoryToken(Type));

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

  it('/TYPE  (GET) OK', async () => {
    const typeFindAll = await request.get('/type').expect(200);
    expect(typeFindAll.body.length).toBeGreaterThanOrEqual(1);
  });

  it('./TYPE (POST) - CREATE TYPE OK ', async () => {
    const {
      body: { message },
    } = await request.post('/type').send(TypeE2EMock.createType).expect(201);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/TYPE (POST) - ERROR CREATE TYPE [MOCK]', async () => {
    const spySaveError = jest.spyOn(typeRepositoryMock, 'save').mockRejectedValueOnce(new Error());
    await request.post('/type').send(TypeE2EMock.createType).expect(500);
    expect(spySaveError).toBeCalled();
  });

  it('/TYPE (PATCH)  - UPDATE TYPE OK ', async () => {
    const {
      body: { message },
    } = await request.patch('/type').send(updateType).expect(200);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/TYPE (PATCH) - ERROR UPDATE TYPE [MOCK]', async () => {
    jest.spyOn(typeRepositoryMock, 'update').mockResolvedValueOnce({ affected: 0 });
    await request.patch('/type').send(updateType).expect(500);
  });

  it('/TYPE (DELETE) - OK [MOCK]', async () => {
    jest.spyOn(typeRepositoryMock, 'delete').mockResolvedValueOnce(null);
    const {
      body: { message },
    } = await request.delete(`/type/1`).expect(200);
    expect(message).toEqual(Constants.MSG_OK);
  });

  it('/TYPE (DELETE) - ERROR [MOCK]', async () => {
    jest.spyOn(typeRepositoryMock, 'delete').mockRejectedValueOnce(new Error());
    await request.delete(`/type/1`).expect(500);
  });
});
