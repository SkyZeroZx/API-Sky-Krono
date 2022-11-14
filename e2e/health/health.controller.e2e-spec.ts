import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../src/app.module';
import { HealthModule } from '../../src/health/health.module';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  TerminusModule,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

describe('HealthCheck (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request: any;
  let healthCheckService: any;
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;
  let memoryHealthIndicator: MemoryHealthIndicator;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, HealthModule, TerminusModule],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: typeOrmHealthIndicator },
        { provide: MemoryHealthIndicator, useValue: memoryHealthIndicator },
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    // Inicializamos nuestro validator de los DTO/Entities para validar las excepciones
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    ),
      await app.init();
    healthCheckService = moduleFixture.get<HealthCheckService>(HealthCheckService);
    request = superTest.agent(app.getHttpServer());
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  // Al finalizar todos nuevos test cerramos las conexiones para evitar memory leaks
  afterAll(async () => {
    await app.close();
  });

  it('/HEALTH  (GET) OK', async () => {
    const spyCheckService = jest.spyOn(healthCheckService, 'check').mockResolvedValueOnce(null);
    await request.get('/health').expect(200);
    expect(spyCheckService).toBeCalled;
  });
});
