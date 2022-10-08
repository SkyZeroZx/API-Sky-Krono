import { Injectable, Logger, RequestTimeoutException } from '@nestjs/common';
import { Upload } from '@aws-sdk/lib-storage';
import { CompleteMultipartUploadOutput, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);

  async uploadFile(imageBuffer: Buffer, filename: string): Promise<CompleteMultipartUploadOutput> {
    this.logger.log(`Subiendo archivo ${filename}`);
    try {
      const parallelUploads3 = new Upload({
        client: new S3Client({ region: process.env.AWS_REGION }),
        params: {
          Bucket: process.env.AWS_BUCKET,
          Key: filename,
          Body: imageBuffer,
        },
      });

      return parallelUploads3.done();
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al subir el archivo', error });
      throw new RequestTimeoutException('Sucedio un error al subir el archivo');
    }
  }
}
