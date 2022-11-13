import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  ENABLED_MYSQL_CACHE,
} from './common/constants/Constant';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { TypeModule } from './type/type.module';
import { TaskToUserModule } from './task_to_user/task_to_user.module';
import { ScheduleModule as ScheduleModuleNestJs } from '@nestjs/schedule';
import { ChargueModule } from './chargue/chargue.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ScheduleModule } from './schedule/schedule.module';
import { LicenceModule } from './licence/licence.module';
import { AwsS3Module } from './aws-s3/aws-s3.module';
import { NotificationModule } from './notification/notification.module';
import { HealthModule } from './health/health.module';
import {
  makeCounterProvider,
  makeHistogramProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { HttpLoggingInterceptor } from './common/interceptor/http-logging.interceptor';
import { register } from 'prom-client';

// for clear old registers
register.clear();
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>(DATABASE_HOST),
        port: parseInt(config.get<string>(DATABASE_PORT), 10),
        username: config.get<string>(DATABASE_USERNAME),
        password: config.get<string>(DATABASE_PASSWORD),
        database: config.get<string>(DATABASE_NAME),
        timezone: 'Z',
        entities: [__dirname + './**/**/*entity{.ts,.js}'],
        cache: config.get<boolean>(ENABLED_MYSQL_CACHE),
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrometheusModule.register(),
    ScheduleModuleNestJs.forRoot(),
    AuthModule,
    TaskModule,
    TypeModule,
    UserModule,
    NotificationModule,
    TaskToUserModule,
    ChargueModule,
    AttendanceModule,
    ScheduleModule,
    LicenceModule,
    AwsS3Module,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    makeHistogramProvider({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['route', 'method', 'code'],
      // buckets for response time from 0.1ms to 500ms
      buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500],
    }),
    makeCounterProvider({
      name: 'http_request_total',
      help: 'Total of HTTP request',
      labelNames: ['route', 'method', 'code'],
    }),
    makeHistogramProvider({
      name: 'http_response_size_bytes',
      help: 'Size in bytes of response',
      labelNames: ['route', 'method', 'code'],
      buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500],
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggingInterceptor)
      .exclude(
        { path: 'metrics', method: RequestMethod.GET },
        { path: 'health', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
