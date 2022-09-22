import { IsNotEmpty } from 'class-validator';
import { Entity, Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Licence {
  @PrimaryGeneratedColumn()
  id: number;
  
  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'codUser' })
  @Column()
  codUser: number;

  @Column({ type: 'text', nullable: false })
  @IsNotEmpty()
  description: string;

  @Column({ type: 'date', nullable: false })
  @IsNotEmpty()
  dateInit: Date;

  @Column({ type: 'date', nullable: false })
  @IsNotEmpty()
  dateEnd: Date;
}
