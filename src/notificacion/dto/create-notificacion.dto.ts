import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificacionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tokenPush: string;
}
