import { ApiProperty } from '@nestjs/swagger';
import { MinLength, IsString, IsNotEmpty, MaxLength, IsArray, IsNumber } from 'class-validator';
import { User } from '../../user/entities/user.entity';

export class CreateTaskDto {
  @ApiProperty()
  @IsNumber()
  codType: number;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(255)
  description: string;

  @IsNotEmpty()
  dateRange: Date[];

  @IsArray()
  users: User[];
}
