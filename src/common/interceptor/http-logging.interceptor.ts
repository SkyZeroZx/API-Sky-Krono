import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggingInterceptor implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  constructor(
    @InjectMetric('http_request_duration_ms')
    private httpRequestDuration: Histogram<any>,
    @InjectMetric('http_request_total')
    private httpCounter: Counter<string>,
    @InjectMetric('http_response_size_bytes')
    private responseSizeHistogram: Histogram<string>,
  ) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const startAt = process.hrtime();
    response.on('finish', () => {
      const { ip, method, originalUrl } = request;
      const { statusCode } = response;

      const contentLength = parseInt(response.get('content-length')) || 0;
      const diff = process.hrtime(startAt);
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;

      this.httpRequestDuration
        .labels(originalUrl, method, statusCode.toString())
        .observe(responseTime);
      this.responseSizeHistogram
        .labels(originalUrl, method, statusCode.toString())
        .observe(contentLength);
      this.httpCounter.labels(originalUrl, method, statusCode.toString()).inc(1);
      this.logger.log(
        `[${method}] | ${originalUrl} | ${statusCode}  | size ${contentLength} |  delay ${responseTime}ms -  ${ip}`,
      );
    });

    next();
  }
}
