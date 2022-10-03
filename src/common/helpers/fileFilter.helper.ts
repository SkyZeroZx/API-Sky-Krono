import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { extname } from 'path';
const logger = new Logger('FilterHelper');

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
  if (file.mimetype.match(/\/(jpg|jpeg|png|bmp)$/)) {
    callback(null, true);
  } else {
    logger.error(`Unsupported file type ${extname(file.originalname)}`);
    callback(
      new HttpException(
        `Unsupported file type ${extname(file.originalname)}`,
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
};

export const maxSizeFile = (file: Express.Multer.File) => {
  if (!file) {
    throw new HttpException('File is empty', HttpStatus.BAD_REQUEST);
  }

  if (file.size >= 5242880) {
    logger.warn(`file ${extname(file.originalname)} exceeds the allowed size`);
    throw new HttpException(
      `file ${extname(file.originalname)} exceeds the allowed size`,
      HttpStatus.BAD_REQUEST,
    );
  }
};
