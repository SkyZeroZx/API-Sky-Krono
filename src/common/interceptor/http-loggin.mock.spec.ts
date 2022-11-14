export class HttpLoggingInterceptorMock {
  public observe = jest.fn().mockReturnThis();
  public inc = jest.fn().mockReturnThis();
  public labels = jest.fn(() => ({
    observe: this.observe,
    inc: this.inc,
  }));
}
