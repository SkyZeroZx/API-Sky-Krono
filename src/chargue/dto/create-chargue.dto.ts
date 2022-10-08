import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateChargueDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  description: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;
}
