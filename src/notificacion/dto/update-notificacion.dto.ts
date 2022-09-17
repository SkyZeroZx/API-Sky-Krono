import { PartialType } from '@nestjs/swagger';
import { CreateNotificacionDto } from './create-notificacion.dto';

export class UpdateNotificacionDto extends PartialType(CreateNotificacionDto) {}
