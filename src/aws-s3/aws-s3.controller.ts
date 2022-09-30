import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AwsS3Service } from './aws-s3.service';

@Controller('aws')
export class AWSS3Controller {
  constructor(private readonly S3Service: AwsS3Service) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file.buffer);
    console.log(file.originalname);
   // return this.S3Service.uploadFile(file.buffer, file.originalname);
    // return this.S3Service.uploadFile(file)
  }
}
