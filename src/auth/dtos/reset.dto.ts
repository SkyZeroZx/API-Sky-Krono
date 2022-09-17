import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ResetUserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;
}
