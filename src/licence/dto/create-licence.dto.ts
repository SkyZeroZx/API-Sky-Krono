import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsNotEmpty, IsArray } from 'class-validator';

export class CreateLicenceDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  dateRange: Date[];

  @ApiProperty()
  @IsNotEmpty()
  codUser: number;
}
