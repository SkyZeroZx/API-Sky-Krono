import { IsNotEmpty, IsOptional } from 'class-validator';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { Util } from '../../common/utils/util';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Attendance {
  //@PrimaryColumn({nullable : true})
  @PrimaryColumn({ type: 'int' })
  id: number = Util.formatDateId();

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'codUser' })
  @Column({ primary: true })
  codUser: number;

  @Column({ type: 'text', default: '' })
  @IsOptional()
  description: string;

  // Reference is check attendance today
  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('boolean')
  @IsNotEmpty()
  isLater: boolean;

  @Column({ type: 'boolean' })
  @IsOptional()
  isAbsent: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  date: Date;

  @CreateDateColumn({ type: 'timestamp' })
  entryTime: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  exitTime: Date;

  @Column('boolean', { default: false })
  @IsOptional()
  isDayOff: boolean;

  @Column('boolean', { default: false })
  @IsOptional()
  isLicence: boolean;
}
