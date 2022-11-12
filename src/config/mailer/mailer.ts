import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const logger = new Logger('NodeMailer');

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter
  .verify()
  .then(() => {
    logger.log('Servidor de correos inicializado');
    logger.error('Process APP_NAME', process.env.APP_NAME)
    logger.error('Process DATABASE_HOST', process.env.DATABASE_HOST)
    logger.error('Process URL_WEB', process.env.URL_WEB) 
  })
  .catch((error) => {
    logger.error('Process APP_NAME', process.env.APP_NAME)
    logger.error('Process DATABASE_HOST', process.env.DATABASE_HOST)
    logger.error('Process URL_WEB', process.env.URL_WEB) 
    logger.error('Sucedio un error al iniciarlizar el servidor de correos', error);
  });
