import { Controller, Post, Body, UseGuards, Logger, Get } from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDecorator as User } from '../common/decorators/user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { SendNotificacionDto } from './dto/send-notificacion.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { NotificationResponse } from '../common/swagger/response/notification.response';

@ApiTags('Notificaciones')
@ApiBearerAuth()
@Controller('notificacion')
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}
  private readonly logger = new Logger(NotificacionController.name);

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Registra el token del usuario logeado' })
  @ApiBody(NotificationResponse.bodySaveToken)
  @ApiResponse(NotificationResponse.genericReponse)
  async registerSuscriptionNotification(
    @User() user: UserEntity,
    @Body() createNotificacionDto: CreateNotificacionDto,
  ) {
    this.logger.log(`Guardando Token para el usuario logeado ${user.username}`);
    return this.notificacionService.suscribeNotification(user.id, createNotificacionDto);
  }

  @Auth('admin')
  @Post('/send')
  @ApiOperation({ summary: 'Envio de notificacion push a los usuarios asignados a la nueva tarea' })
  @ApiResponse(NotificationResponse.genericReponse)
  async registerTaskTokenByUser(@Body() sendNotificacionDto: SendNotificacionDto) {
    this.logger.log(`Enviando notificaciones de nueva tarea creada a los usuarios `);
    return this.notificacionService.registerTaskTokenByUser(sendNotificacionDto.users);
  }

  /*
  @Get()
  async getAllJobs() {
    this.logger.log('Listando jobs registrados');
    return this.notificacionService.getCrons();
  }

  @Post('/jobs')
  async registerJobs(@Body() data : any ) {
    this.logger.log('Registrando un job' , {message: data});
    return this.notificacionService.registerNewJob(data);
  }
  @Post('/stop_jobs')
  async stopJobs(@Body() data : any ) {
    this.logger.log('Stop un job' , {message: data});
    return this.notificacionService.stopCrons(data);
  }*/
}
