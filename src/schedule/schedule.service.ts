import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob, CronTime } from 'cron';
import { Repository } from 'typeorm';
import { Constants } from '../common/constants/Constant';
import { Util } from '../common/utils/util';
import { NotificacionService } from '../notificacion/notificacion.service';
import { User } from '../user/entities/user.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';

@Injectable()
export class ScheduleService implements OnModuleInit {
  private readonly logger = new Logger(ScheduleService.name);
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly notificacionService: NotificacionService,
  ) {}

  onModuleInit() {
    this.logger.log('Se esta inicializado el servicio Scheduler se registraran los cron jobs');
    //RESTART_SAVE_CRONS
    this.restartSavedCrons();
  }

  async create(createScheduleDto: CreateScheduleDto) {
    this.logger.log({ message: 'Creando un nuevo Schedule', createScheduleDto });
    try {
      //ADD CRON
      const schedule = await this.scheduleRepository.save(createScheduleDto);
      console.log('Mi registro guardado es ', schedule);
      this.registerCronJob(schedule);
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al crear el nuevo Schedule', error });
      throw new InternalServerErrorException('Sucedio un error al crear el Schedule');
    }

    return {
      message: Constants.MSG_OK,
      info: 'Schedule registrado exitosamente',
    };
  }

  findAll() {
    this.logger.log('Listando Schedule');
    return this.scheduleRepository.find();
  }

  async findScheduleByUser(id: number): Promise<Schedule> {
    return this.scheduleRepository
      .createQueryBuilder('SCHEDULE')
      .select('SCHEDULE.entryHour', 'entryHour')
      .addSelect('SCHEDULE.exitHour', 'exitHour')
      .addSelect('SCHEDULE.monday', 'monday')
      .addSelect('SCHEDULE.tuesday', 'tuesday')
      .addSelect('SCHEDULE.wednesday', 'wednesday')
      .addSelect('SCHEDULE.thursday', 'thursday')
      .addSelect('SCHEDULE.friday', 'friday')
      .addSelect('SCHEDULE.saturday', 'saturday')
      .addSelect('SCHEDULE.sunday', 'sunday')
      .addSelect('SCHEDULE.toleranceTime', 'toleranceTime')
      .addSelect('SCHEDULE.notificationIsActive', 'notificationIsActive')
      .innerJoin(User, 'USER', 'SCHEDULE.id = USER.codSchedule')
      .where('USER.id =:id', { id: id })
      .getRawOne();
  }

  async update(updateScheduleDto: UpdateScheduleDto) {
    this.logger.log({ message: 'Actualizando Schedule', updateScheduleDto });
    try {
      const updateSchedule = this.scheduleRepository.create(updateScheduleDto);
      const { affected } = await this.scheduleRepository.update(
        { id: updateScheduleDto.codSchedule },
        updateSchedule,
      );

      if (affected == 1) {
        // UPDATE CRON JOB setTime(time: CronTime) or DELETE
        const updateJob = this.schedulerRegistry.getCronJob(
          updateScheduleDto.codSchedule.toString(),
        );
        updateJob.setTime(new CronTime(Util.formatCronJob(updateScheduleDto as any)));
        this.logger.log('Se actualizo satisfactoriamente el Schedule');
        return { message: Constants.MSG_OK, info: 'Se actualizo exitosamente el Schedule' };
      }
      this.logger.warn(`Sucedio un error al actualizar el Schedule`);
      throw new InternalServerErrorException('Sucedio un error al actualizar el Schedule');
    } catch (error) {
      this.logger.error({ message: `Sucedio un error al intentar actualizar el Schedule`, error });
      throw new InternalServerErrorException('Sucedio un error al actualizar el Schedule');
    }
  }

  async remove(id: number) {
    try {
      //DELETE CRON JOB
      await this.scheduleRepository.delete(id);
      this.schedulerRegistry.deleteCronJob(id.toString());
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al eliminar al eliminar el Schedule', error });
      throw new InternalServerErrorException('Sucedio un error al eliminar el Schedule');
    }

    this.logger.log(`Se elimino exitosamente el Schedule ${id}`);
    return {
      message: Constants.MSG_OK,
      info: 'Se elimino exitosamente el Schedule',
    };
  }

  async restartSavedCrons() {
    const listSchedule = await this.scheduleRepository.find({
      where: { notificationIsActive: true },
    });
    this.logger.log({ message: 'List Schedule', listSchedule });
    listSchedule.forEach((schedule) => {
      this.registerCronJob(schedule);
    });
  }

  registerCronJob(schedule: Schedule) {
    this.logger.log(`Se va registrar el cron Job ${schedule.name}`);
    console.log('Cron Time is', Util.formatCronJob(schedule));
    const userSyncJob = new CronJob(Util.formatCronJob(schedule), () =>
      this.sendNotificationByScheduler(schedule),
    );
    this.schedulerRegistry.addCronJob(schedule.id.toString(), userSyncJob);
    userSyncJob.start();
  }

  async sendNotificationByScheduler(schedule: Schedule) {
    this.logger.log({ message: 'Se van enviar las notificaciones', schedule });
    const listTokens = await this.notificacionService.findTokensBySchedule(schedule.id);
    listTokens.forEach((token) => {
      this.notificacionService.sendNotification(
        token.tokenPush,
        Constants.NOTIFICATION_REMEMBER_ATTEDANCE,
      );
    });
  }
}
