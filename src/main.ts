import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSwagger } from './common/swagger/swagger';
import cors from 'cors';
import helmet from 'helmet';
import webpush from './config/webpush/webpush';
import { loggerConfig } from './config/logger/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, loggerConfig);
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
  logger.log(`Server Listening : ${await app.getUrl()}`);
}

bootstrap();
