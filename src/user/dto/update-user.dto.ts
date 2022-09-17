import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { User } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(User) {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  status: string;
}
