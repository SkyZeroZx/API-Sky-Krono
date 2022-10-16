import { IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
@Unique(['username'])
export class Challenge {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => User, (User) => User.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'codUser' })
  @Column()
  codUser: number;
  
  
  @Column({ type: 'varchar' , length: 255})
  username : string;

 
  @IsNotEmpty()
  @Column({ type: 'varchar' , length: 255})
  currentChallenge : string;
}
