import { IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Authentication {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User, (User) => User.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'codUser' })
  @Column()
  codUser: number;

  @Column({ type: 'blob' })
  @IsNotEmpty()
  // SQL: Encode to base64url then store as `TEXT`. Index this column
  credentialID: Buffer;
  // SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
  @Column({ type: 'blob' })
  @IsNotEmpty()
  credentialPublicKey: Buffer;
  // SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
  @Column({ type: 'bigint' })
  @IsNotEmpty()
  counter: number;
}
