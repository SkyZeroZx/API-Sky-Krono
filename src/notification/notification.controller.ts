import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDecorator as User } from '../common/decorators/user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { Auth } from '../common/decorators/auth.decorator';
import { NotificationResponse } from '../common/swagger/response/notification.response';
import { SendNotificationDto } from './dto/send-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notificacion')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Registra el token del usuario logeado' })
  @ApiBody(NotificationResponse.bodySaveToken)
  @ApiResponse(NotificationResponse.genericReponse)
  async registerSuscriptionNotification(
    @User() user: UserEntity,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    this.logger.log(`Guardando Token para el usuario logeado ${user.username}`);
    return this.notificationService.suscribeNotification(user.id, createNotificationDto);
  }

  @Auth('admin')
  @Post('/send')
  @ApiOperation({ summary: 'Envio de notificacion push a los usuarios asignados a la nueva tarea' })
  @ApiResponse(NotificationResponse.genericReponse)
  async registerTaskTokenByUser(@Body() sendNotificationDto: SendNotificationDto) {
    this.logger.log(`Enviando notificaciones de nueva tarea creada a los usuarios `);
    return this.notificationService.registerTaskTokenByUser(sendNotificationDto.users);
  }
}
