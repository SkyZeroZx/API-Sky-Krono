import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class ReportChartAttendance {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsArray()
  dateRange: string[];
}
