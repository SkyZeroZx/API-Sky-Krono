import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from '../../task/entities/task.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class TaskToUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'codUser' })
  codUser: number;

  @ManyToOne(() => Task, (task) => task.codTask, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'codTask' })
  codTask: number;
}
