import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { NotificacionModule } from './notificacion/notificacion.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  ENABLED_MYSQL_CACHE,
  CACHE_TTL,
  CACHE_MAX_ITEMS,
  CACHE_GLOBAL_NESTJS,
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
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';

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
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        ttl: parseInt(configService.get<string>(CACHE_TTL), 10),
        max: parseInt(configService.get<string>(CACHE_MAX_ITEMS), 10),
     //   isGlobal: configService.get<boolean>(CACHE_GLOBAL_NESTJS),
      }),
      inject: [ConfigService],
    }),
    ScheduleModuleNestJs.forRoot(),
    AuthModule,
    TaskModule,
    TypeModule,
    UserModule,
    NotificacionModule,
    TaskToUserModule,
    ChargueModule,
    AttendanceModule,
    ScheduleModule,
    LicenceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}