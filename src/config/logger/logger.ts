import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';

export const loggerConfig = {
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
        watchLog: true,
        maxSize: process.env.MAX_SIZE,
        maxFiles: process.env.MAX_DAYS,
        level: 'info',
      }),
      new winston.transports.DailyRotateFile({
        filename: `${process.env.LOG_FOLDER}/${process.env.APP_NAME}-WARN-%DATE%.json`,
        datePattern: process.env.DATE_PATTERN,
        zippedArchive: true,
        watchLog: true,
        maxSize: process.env.MAX_SIZE,
        maxFiles: process.env.MAX_DAYS,
        level: 'warn',
      }),
      new winston.transports.DailyRotateFile({
        filename: `${process.env.LOG_FOLDER}/${process.env.APP_NAME}-ERROR-%DATE%.json`,
        datePattern: process.env.DATE_PATTERN,
        zippedArchive: true,
        watchLog: true,
        maxSize: process.env.MAX_SIZE,
        maxFiles: process.env.MAX_DAYS,
        level: 'error',
      }),
    ],
  }),
};
