import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description: string;
}
