import { HttpLoggingInterceptorMock } from './http-loggin.mock.spec';
import { HttpLoggingInterceptor } from './http-logging.interceptor';
import * as httpMocks from 'node-mocks-http';

describe('HttpLoggingInterceptor', () => {
  let httpRequestDuration: any = new HttpLoggingInterceptorMock();

  let httpCounter: any = new HttpLoggingInterceptorMock();

  let responseSizeHistogram: any = new HttpLoggingInterceptorMock();
  let requestSizeHistogram: any = new HttpLoggingInterceptorMock();

  let testValue = new HttpLoggingInterceptor(
    httpRequestDuration,
    httpCounter,
    responseSizeHistogram,
    requestSizeHistogram,
  );

  it('should be defined', () => {
    expect(
      new HttpLoggingInterceptor(
        httpRequestDuration,
        httpCounter,
        responseSizeHistogram,
        requestSizeHistogram,
      ),
    ).toBeDefined();
  });

  it('Validate Use ', () => {
    const mockRequest = httpMocks.createRequest();
    const mockResponse = httpMocks.createResponse();

    let next = jest.fn().mockReturnThis();
    testValue.use(mockRequest, mockResponse, next);
  });
});
