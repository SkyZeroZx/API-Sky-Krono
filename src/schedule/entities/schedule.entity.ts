import { IsMilitaryTime, IsNotEmpty, IsPositive, MaxLength } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity()
@Unique(['name'])
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @Column({ type: 'boolean', default: false })
  notificationIsActive: boolean;

  @Column({ type: 'text' })
  @IsNotEmpty()
  description: string;

  @Column({ type: 'time' })
  @IsMilitaryTime()
  @IsNotEmpty()
  entryHour: string;

  @Column({ type: 'time' })
  @IsMilitaryTime()
  @IsNotEmpty()
  exitHour: string;

  @Column({ type: 'boolean', default: false })
  monday: boolean;

  @Column({ type: 'boolean', default: false })
  tuesday: boolean;

  @Column({ type: 'boolean', default: false })
  wednesday: boolean;

  @Column({ type: 'boolean', default: false })
  thursday: boolean;

  @Column({ type: 'boolean', default: false })
  friday: boolean;

  @Column({ type: 'boolean', default: false })
  saturday: boolean;

  @Column({ type: 'boolean', default: false })
  sunday: boolean;

  @Column({ type: 'int' })
  @IsPositive()
  @IsNotEmpty()
  toleranceTime: number;
}
