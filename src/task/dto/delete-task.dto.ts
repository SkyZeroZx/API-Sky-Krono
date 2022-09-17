import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeleteTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  codTask: number;
}
