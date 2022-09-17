import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from '../../task/entities/task.entity';

@Entity()
export class Type {
  @PrimaryGeneratedColumn()
  @OneToMany(() => Task, (Task) => Task.codType)
  codType: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsNotEmpty()
  typeDescription: string;

  @Column({ type: 'varchar', length: 120 })
  @IsNotEmpty()
  backgroundColor: string;

  @Column({ type: 'varchar', length: 12 })
  @IsNotEmpty()
  borderColor: string;

  @Column({ type: 'time' })
  @IsNotEmpty()
  start: Date;

  @Column({ type: 'time' })
  @IsNotEmpty()
  end: Date;

  @Column({ type: 'varchar', length: 30, default: 'BLOCK' })
  display: string;
}
