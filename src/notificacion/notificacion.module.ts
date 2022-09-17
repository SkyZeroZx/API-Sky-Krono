import { Module } from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { NotificacionController } from './notificacion.controller';
import { Notificacion } from './entities/notificacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskToUserModule } from '../task_to_user/task_to_user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion]), TaskToUserModule],
  controllers: [NotificacionController],
  providers: [NotificacionService],
  exports: [NotificacionService],
})
export class NotificacionModule {}
