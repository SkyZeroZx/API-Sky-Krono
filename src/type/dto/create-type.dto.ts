import { ApiProperty } from '@nestjs/swagger';
import { IsMilitaryTime, IsNotEmpty, IsString } from 'class-validator';

export class CreateTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  backgroundColor: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  borderColor: string;

  @ApiProperty()
  @IsMilitaryTime()
  @IsNotEmpty()
  start: string;

  @ApiProperty()
  @IsMilitaryTime()
  @IsNotEmpty()
  end: string;
}
