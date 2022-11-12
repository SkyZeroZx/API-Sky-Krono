import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  NestMiddleware,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { validRoutes } from '../helpers/valid-routes.helper';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor, NestMiddleware {
  constructor(
    @InjectMetric('http_request_duration_ms')
    private readonly httpRequestDuration: Histogram<any>,
  ) {}

  use(request: Request, response: Response, next: NextFunction): void {
       const now = Date.now();
    const startAt = process.hrtime();
    response.on('finish', () => {
      const { ip, method, originalUrl } = request;
      const delay = Date.now() - now;
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const diff = process.hrtime(startAt);
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode}  delay ${responseTime}ms  delay2 ${delay}    ${contentLength} -  ${ip}`,
      );
    });

    // const now = Date.now();
    // const { ip, method, originalUrl } = request;
    // const userAgent = request.get('user-agent') || '';
    // console.log('RESPONSE IS', typeof response);
    // response.once('close', tap(() => {})  )
    // response.on('close', () => {
    //   const { statusCode } = response;
    //   const contentLength = response.get('content-length');
    //   const delay = Date.now() - now;
    //   this.logger.log(
    //     `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} DELAY ${delay}`,
    //   );
    // })
    // response.on('ok', () => {
    //   console.log('RESPONSE OK')
    // })
    // response.on('error', () => {
    //   console.log('RESPONSE error')
    // })
    next();
  }

  private readonly logger = new Logger(HttpLoggingInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.originalUrl;

    return next.handle().pipe(
      tap(() => {
        if (validRoutes(url)) {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          this.httpRequestDuration.labels(url, method, response.statusCode).observe(delay);
          this.logger.log(`${response.statusCode} | [${method}] ${url} - ${delay}ms`);
        }
      }),
      catchError((error) => {
        if (validRoutes(url)) {
          const statusCode = error.response.statusCode ? error.response.statusCode : error.status;
          const delay = Date.now() - now;
          this.logger.error(`${statusCode} | [${method}] ${url} - ${delay}ms`);
          this.httpRequestDuration.labels(url, method, statusCode).observe(delay);
          return throwError(() => error);
        }
      }),
    );
  }
}
