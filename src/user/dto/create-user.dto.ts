import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsNumber()
  codChargue: number;

  @ApiProperty()
  @IsNumber()
  codSchedule: number;

  @ApiProperty()
  @MinLength(6)
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @MinLength(9)
  @MaxLength(9)
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @IsNotEmpty()
  fatherLastName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @IsNotEmpty()
  motherLastName: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: string;
}
