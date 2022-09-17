import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number;
}
