import { IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TaskToUser } from '../../task_to_user/entities/task_to_user.entity';
import { Type } from '../../type/entities/type.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  @OneToMany(() => TaskToUser, (TaskToUser) => TaskToUser.codTask, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  codTask: number;

  @ManyToOne(() => Type, (Type) => Type.codType)
  @JoinColumn({ name: 'codType' })
  codType: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'longtext', nullable: true })
  description: string;

  @Column({ type: 'date' })
  @IsNotEmpty()
  start: Date;

  @Column({ type: 'date' })
  @IsNotEmpty()
  end: Date;
}
