import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { CreateScheduleDto } from './create-schedule.dto';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @ApiProperty()
  @IsNotEmpty()
  codSchedule: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  notificationIsActive: boolean;
}
