import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSwagger } from './common/swagger/swagger';
import * as cors from 'cors';
import helmet from 'helmet';
import webpush from './config/webpush/webpush';
import { loggerConfig } from './config/logger/logger';
async function bootstrap() {
  console.log('Process DATABASE_HOST', process.env.DATABASE_HOST);
  console.log('Process URL_WEB', process.env.URL_WEB);
  console.log('Process APP_NAME', process.env.APP_NAME);
  const app = await NestFactory.create(AppModule, loggerConfig);
  console.log('Process DATABASE_HOST', process.env.DATABASE_HOST);
  console.log('Process URL_WEB', process.env.URL_WEB);
  console.log('Process APP_NAME', process.env.APP_NAME);
  const logger = new Logger(bootstrap.name);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.use(cors());
  app.use(helmet());
  app.use(helmet.hidePoweredBy());
  initSwagger(app);
  await app.listen(process.env.PORT || 3000);

  webpush();
  console.log('Process DATABASE_HOST', process.env.DATABASE_HOST);
  console.log('Process URL_WEB', process.env.URL_WEB);
  console.log('Process APP_NAME', process.env.APP_NAME);
  logger.log(`Server Listening : ${await app.getUrl()}`);
}
bootstrap();
