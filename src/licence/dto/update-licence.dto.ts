import { PartialType } from '@nestjs/swagger';
import { CreateLicenceDto } from './create-licence.dto';

export class UpdateLicenceDto extends PartialType(CreateLicenceDto) {}
