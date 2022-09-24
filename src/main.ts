import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSwagger } from './common/swagger/swagger';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as cors from 'cors';
import helmet from 'helmet';
import webpush from './config/webpush/webpush';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { Cluster } from './config/cluster/cluster.service';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
async function bootstrap() {
  // Custom Logger replace logger NestJs with winston logger
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: WinstonModule.createLogger({
      exitOnError: false,
      format: winston.format.combine(
        winston.format.timestamp({ format: process.env.TIMESTAMP_FORMAT }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.json(),
            winston.format.timestamp(),
            winston.format.errors({ stacks: true }),
            nestWinstonModuleUtilities.format.nestLike(process.env.APP_NAME, {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          filename: `${process.env.LOG_FOLDER}/${process.env.APP_NAME}-INFO-%DATE%.json`,
          datePattern: process.env.DATE_PATTERN,
          zippedArchive: true,
          maxSize: process.env.MAX_SIZE,
          maxFiles: process.env.MAX_DAYS,
          level: 'info',
        }),
        new winston.transports.DailyRotateFile({
          filename: `${process.env.LOG_FOLDER}/${process.env.APP_NAME}-WARN-%DATE%.json`,
          datePattern: process.env.DATE_PATTERN,
          zippedArchive: true,
          maxSize: process.env.MAX_SIZE,
          maxFiles: process.env.MAX_DAYS,
          level: 'warn',
        }),
        new winston.transports.DailyRotateFile({
          filename: `${process.env.LOG_FOLDER}/${process.env.APP_NAME}-ERROR-%DATE%.json`,
          datePattern: process.env.DATE_PATTERN,
          zippedArchive: true,
          maxSize: process.env.MAX_SIZE,
          maxFiles: process.env.MAX_DAYS,
          level: 'error',
        }),
      ],
    }),
  });
  const logger = new Logger(bootstrap.name);

  // Habilitamos la whitelist con ValidationPipe al inicializar nuestra API
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.use(cors());
  app.use(helmet());
  initSwagger(app);
  await app.listen(process.env.PORT || 3000);

  webpush();

  logger.log(`El servidor se ejecuta en ${await app.getUrl()}`);
}
bootstrap();
//Cluster.register(8,bootstrap);
