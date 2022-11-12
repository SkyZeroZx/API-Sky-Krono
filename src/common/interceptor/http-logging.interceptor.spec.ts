import { HttpLoggingInterceptor } from './http-logging.interceptor';

describe('HttpLoggingInterceptor', () => {
  it('should be defined', () => {
    const test :any = null
    expect(new HttpLoggingInterceptor(test)).toBeDefined();
  });
});
