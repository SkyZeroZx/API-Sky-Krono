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
        cache: true,
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      ttl: 60, // seconds
      max: 300, // maximum number of items in cache
      isGlobal: true,
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
