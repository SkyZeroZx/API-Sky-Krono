import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { User } from '../../user/entities/user.entity';

export class SendNotificationDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  users: User[];
}
