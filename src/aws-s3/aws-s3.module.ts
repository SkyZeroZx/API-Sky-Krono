import { Module } from '@nestjs/common';
import { AWSS3Controller } from './aws-s3.controller';
import { AwsS3Service } from './aws-s3.service';

@Module({
  providers: [AwsS3Service],
  controllers: [AWSS3Controller],
  exports: [AwsS3Service],
})
export class AwsS3Module {}
