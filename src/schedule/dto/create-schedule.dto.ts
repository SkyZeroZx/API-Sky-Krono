import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMilitaryTime,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(150)
  name: string;

  @ApiProperty()
  @MinLength(5)
  @MaxLength(250)
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsMilitaryTime()
  @IsNotEmpty()
  entryHour: string;

  @ApiProperty()
  @IsMilitaryTime()
  @IsNotEmpty()
  exitHour: string;

  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  toleranceTime: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  monday: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  tuesday: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  wednesday: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  thursday: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  friday: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  saturday: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  sunday: boolean;
}
