import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../src/app.module';
import { TaskModule } from '../../src/task/task.module';
import * as config from '../config-e2e.json';
import { TypeModule } from '../../src/type/type.module';
import { Type } from '../../src/type/entities/type.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TypeController (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request;
  let typeRepositoryMock: any;
  const {
    jwtToken,
    findTask: { id: idTask },
    taskByUser,
    tasks: { updateTask },
    users: { userLoginOk, userReseteado, userCreado, userBloqueado, userSuscrito },
  } = config.env;

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Al finalizar todos nuevos test cerramos las conexiones para evitar memory leaks
  afterAll(async () => {
    await app.close();
  });

  it('/TYPE  (GET) OK', async () => {
    const typeFindAll = await request.get('/type').expect(200);
    expect(typeFindAll.body.length).toBeGreaterThanOrEqual(1);
  });
});
