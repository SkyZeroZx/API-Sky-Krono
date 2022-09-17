import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskToUser } from './entities/task_to_user.entity';
import { TaskToUserService } from './task_to_user.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskToUser])],
  providers: [TaskToUserService],
  exports: [TaskToUserService],
})
export class TaskToUserModule {}
