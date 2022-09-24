import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CACHE_TTL, CACHE_MAX_ITEMS } from '../common/constants/Constant';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        ttl: parseInt(configService.get<string>(CACHE_TTL), 10),
        max: parseInt(configService.get<string>(CACHE_MAX_ITEMS), 10),
        //   isGlobal: configService.get<boolean>(CACHE_GLOBAL_NESTJS),
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
