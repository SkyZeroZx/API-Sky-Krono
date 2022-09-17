import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../src/app.module';
 
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });



  it('/ (GET)', async() => {
    return   superTest(app.getHttpServer()).get('/').expect(200).expect('Sky Calendar API');
  });
});
