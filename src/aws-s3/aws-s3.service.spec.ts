import { Test, TestingModule } from '@nestjs/testing';
import { AwsS3Service } from './aws-s3.service';
import { Constants } from '../common/constants/Constant';
import { RequestTimeoutException } from '@nestjs/common';

const mockUploadInstance = {
  upload: jest.fn().mockReturnThis(),
  done: jest.fn(),
  promise: jest.fn(),
};

jest.mock('@aws-sdk/lib-storage', () => {
  return { Upload: jest.fn(() => mockUploadInstance) };
});

describe('AwsS3Service', () => {
  let awsS3Service: AwsS3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsS3Service],
    }).compile();

    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
  });

  it('should be defined', () => {
    expect(awsS3Service).toBeDefined();
  });

  it('Validate uploadFile OK', async () => {
    mockUploadInstance.promise.mockResolvedValueOnce(Constants.MSG_OK);
    await awsS3Service.uploadFile(null, 'FileNameMock');
    expect(mockUploadInstance.done).toBeCalled();
  });

  it('Validate uploadFile Error', async () => {
    mockUploadInstance.done.mockImplementationOnce(() => {
      throw new Error();
    });
    await expect(awsS3Service.uploadFile(null, 'FileNameMock')).rejects.toThrowError(
      new RequestTimeoutException({
        message: 'Sucedio un error al subir el archivo',
      }),
    );
  });
});
