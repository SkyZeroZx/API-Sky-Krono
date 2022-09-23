import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateLicenceDto } from './create-licence.dto';

export class UpdateLicenceDto extends PartialType(CreateLicenceDto) {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
