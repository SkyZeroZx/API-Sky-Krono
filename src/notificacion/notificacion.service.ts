import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Constant } from '../common/constants/Constant';
import { TaskToUser } from '../task_to_user/entities/task_to_user.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { Notificacion } from './entities/notificacion.entity';
import * as webpush from 'web-push';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Schedule } from '../schedule/entities/schedule.entity';

@Injectable()
export class NotificacionService {
  private readonly logger = new Logger(NotificacionService.name);
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>, // private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async suscribeNotification(codUser: number, createNotificacionDto: CreateNotificacionDto) {
    this.logger.log({ message: 'Suscribiendo el token para el usuario', createNotificacionDto });
    try {
      // Validamos si existe alguna coincidencia
      const [, count] = await this.notificacionRepository.findAndCount({
        where: {
          codUser: codUser,
          tokenPush: createNotificacionDto.tokenPush,
        },
      });
      // En caso no devuelva 0 significa que no existe por lo cual vamos a registrarlo
      if (count == 0) {
        await this.notificacionRepository.save({
          codUser: codUser,
          tokenPush: createNotificacionDto.tokenPush,
        });
      }
    } catch (error) {
      this.logger.error(`Sucedio un error al guardar el token`, error);
      throw new InternalServerErrorException('Sucedio un error al guardar el token');
    }

    this.logger.log('Se guardo el Token Task To User');
    return { message: Constant.MENSAJE_OK, info: 'Se guardo el token exitosamente' };
  }

  async sendNotification(tokenPush: string, message: Object) {
    this.logger.log({ message: 'Envio Notificacion al token  el valor es', tokenPush });
    webpush
      .sendNotification(JSON.parse(tokenPush), JSON.stringify(message))
      .then((res) => {
        this.logger.log({ message: 'Se envio notificacion ', res });
      })
      .catch((err) => {
        this.logger.warn({
          message: `Fallo al enviar notificacion statusCode : ${err.statusCode}`,
          err,
        });
      });
  }

  async findTokensByUser(codUser: number) {
    return this.notificacionRepository
      .createQueryBuilder('NOTIFICACION')
      .select('DISTINCT   (NOTIFICACION.tokenPush)', 'tokenPush')
      .innerJoin(User, 'USER', ' USER.id = NOTIFICACION.codUser')
      .where('USER.id = :id', {
        id: codUser,
      })
      .getRawMany();
  }

  async findTokensByTask(codTask: number) {
    return this.notificacionRepository
      .createQueryBuilder('NOTIFICACION')
      .select('DISTINCT   (NOTIFICACION.tokenPush)', 'tokenPush')
      .innerJoin(User, 'USER', ' USER.id = NOTIFICACION.codUser')
      .innerJoin(TaskToUser, 'TASK_TO_USER', ' TASK_TO_USER.codUser = USER.id')
      .where('TASK_TO_USER.codTask = :codTask', {
        codTask: codTask,
      })
      .getRawMany();
  }

  async findTokensBySchedule(codSchedule: number) {
    return this.notificacionRepository
      .createQueryBuilder('NOTIFICACION')
      .select('DISTINCT   (NOTIFICACION.tokenPush)', 'tokenPush')
      .innerJoin(User, 'USER', ' USER.id = NOTIFICACION.codUser')
      .innerJoin(Schedule, 'SCHEDULE', ' SCHEDULE.id = USER.codSchedule')
      .where('SCHEDULE.id = :codSchedule', {
        codSchedule: codSchedule,
      })
      .getRawMany();
  }

  async registerTaskTokenByUser(listUsers: User[]) {
    this.logger.log('Obteniendo Tokens para la nueva tarea creada');
    let tokensPerUser: any[] = [];
    try {
      listUsers.forEach((user) => {
        tokensPerUser.push(this.findTokensByUser(user.id));
      });

      tokensPerUser = await Promise.all(tokensPerUser);

      tokensPerUser.forEach((tokens) => {
        tokens.forEach((token) => {
          this.sendNotification(token.tokenPush, Constant.NOTIFICACION_NEW_TASK);
        });
      });

      this.logger.log('Notificaciones enviadas exitosamente');
      return {
        message: Constant.MENSAJE_OK,
        info: 'Notificaciones enviadas exitosamente',
      };
    } catch (error) {
      this.logger.error('Sucedio un error al registrar tokens para la nueva tarea', error);
      throw new InternalServerErrorException(
        'Sucedio un error al registrar tokens para la nueva tarea',
      );
    }
  }
  /*
  myScheduledTask(data) {
    this.logger.log('test esto es una prueba guarde el param', data.name);
  }

  registerNewJob(data: any) {
    const userSyncJob = new CronJob('15 * * * * *', () => this.myScheduledTask(data));
    this.schedulerRegistry.addCronJob(data.name, userSyncJob);
    userSyncJob.start();
    return { message: Constant.MENSAJE_OK };
  }

  getCrons() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key, map) => {
      let next;
      try {
        next = value.nextDates().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      this.logger.log(`job: ${key} -> next: ${next}`);
    });
  }

  stopCrons(data){
    let job = this.schedulerRegistry.getCronJob(data.name);
    this.schedulerRegistry.deleteCronJob(data.name)
    
  }*/
}
