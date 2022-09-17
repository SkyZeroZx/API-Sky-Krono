import {
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { MinLength, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { Notificacion } from '../../notificacion/entities/notificacion.entity';
import { TaskToUser } from '../../task_to_user/entities/task_to_user.entity';
import { Constant } from '../../common/constants/Constant';
import { Chargue } from '../../chargue/entities/chargue.entity';
import { Schedule } from '../../schedule/entities/schedule.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';

@Entity()
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn()
  @OneToMany(() => TaskToUser, (TaskToUser) => TaskToUser.codUser, {
    nullable: false,
  })
  @JoinColumn()
  @OneToMany(() => Notificacion, (Notificacion) => Notificacion.id, {
    nullable: false,
  })
  @OneToMany(() => Attendance, (Attendance) => Attendance.id, {
    nullable: false,
  })
  id: number;

  @ManyToOne(() => Chargue, (chargue) => chargue.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'codChargue' })
  @Column()
  codChargue: number;

  @ManyToOne(() => Schedule, (schedule) => schedule.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'codSchedule' })
  @Column()
  codSchedule: number;
  /*
  @ManyToOne(() => Attendance, (attendance) => attendance.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'codAttendance' })
  @Column({ nullable: true })
  codAttendance: number;
  */

  @Column({ type: 'varchar', length: 255, nullable: false })
  @MinLength(6)
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @Column({ type: 'varchar', length: 128, nullable: false, select: false })
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @Column()
  @IsNotEmpty()
  role: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updateAt: Date;

  @Column('varchar', { length: 80 })
  @MinLength(2)
  @MaxLength(80)
  @IsNotEmpty()
  name: string;

  @Column('varchar', { length: 120 })
  @MinLength(2)
  @MaxLength(120)
  @IsNotEmpty()
  fatherLastName: string;

  @Column('varchar', { length: 120 })
  @MinLength(2)
  @MaxLength(120)
  @IsNotEmpty()
  motherLastName: string;

  @Column('varchar', { length: 35, default: 'CREADO' })
  status: string;

  @Column('boolean', { default: true })
  firstLogin: boolean;

  @Column('text', { default: null })
  photo: string;

  @Column('varchar', { length: 9, default: null })
  @MinLength(9)
  @MaxLength(9)
  @IsNotEmpty()
  phone: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this.password) {
      return;
    }
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }

  @BeforeUpdate()
  async firstLoginStatus() {
    if (this.status === Constant.STATUS_USER.HABILITADO) {
      this.firstLogin = false;
    } else {
      this.firstLogin = true;
    }
  }
}
