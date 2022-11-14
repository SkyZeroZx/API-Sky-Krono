import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggingInterceptor implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  constructor(
    @InjectMetric('http_request_duration_ms')
    private readonly httpRequestDuration: Histogram<any>,
    @InjectMetric('http_request_total')
    private readonly httpCounter: Counter<string>,
    @InjectMetric('http_response_size_bytes')
    private readonly responseSizeHistogram: Histogram<string>,
    @InjectMetric('http_request_size_bytes')
    private readonly requestSizeHistogram: Histogram<string>,
  ) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const startAt = process.hrtime();
    response.on('finish', () => {
      const { ip, method, originalUrl } = request;
      const { statusCode } = response;

      const responseContentLength = parseInt(response.get('content-length')) || 0;
      const requestContentLength = parseInt(request.get('content-length')) || 0;
      const diff = process.hrtime(startAt);
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;

      this.httpRequestDuration
        .labels(originalUrl, method, statusCode.toString())
        .observe(responseTime);

      this.responseSizeHistogram
        .labels(originalUrl, method, statusCode.toString())
        .observe(responseContentLength);

      this.requestSizeHistogram
        .labels(originalUrl, method, statusCode.toString())
        .observe(requestContentLength);

      this.httpCounter.labels(originalUrl, method, statusCode.toString()).inc(1);

      this.logger.log(
        `[${method}] | ${originalUrl} | ${statusCode}  | size ${responseContentLength} |  delay ${responseTime}ms -  ${ip}`,
      );
    });

    next();
  }
}
