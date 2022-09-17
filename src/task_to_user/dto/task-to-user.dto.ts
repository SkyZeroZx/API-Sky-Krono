import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TaskToUserDto {
  @ApiProperty()
  @IsNotEmpty()
  codUser: number;

  @IsNotEmpty()
  codTask: number;
}
