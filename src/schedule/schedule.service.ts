import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob, CronTime } from 'cron';
import { Repository } from 'typeorm';
import { Constants } from '../common/constants/Constant';
import { Util } from '../common/utils/util';
import { NotificationService } from '../notification/notification.service';
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
    private readonly notificationService: NotificationService,
  ) {}

  onModuleInit() {
    this.logger.log('Se esta inicializado el servicio Scheduler se registraran los cron jobs');
    this.restartSavedCrons();
  }

  async create(createScheduleDto: CreateScheduleDto) {
    this.logger.log({ message: 'Creando un nuevo Schedule', createScheduleDto });
    try {
      const schedule = await this.scheduleRepository.save(createScheduleDto);
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
        this.updateCronJob(updateScheduleDto);
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

  updateCronJob(updateScheduleDto: UpdateScheduleDto): void {
    const updateJob = this.schedulerRegistry.getCronJob(updateScheduleDto.codSchedule.toString());
    if (updateScheduleDto.notificationIsActive) {
      updateJob.setTime(new CronTime(Util.formatCronJob(updateScheduleDto as any)));
      updateJob.start();
    } else {
      updateJob.stop();
    }
  }

  async restartSavedCrons() {
    const listSchedule = await this.scheduleRepository.find({
      where: { notificationIsActive: true },
    });
    this.logger.log({ message: 'List Schedule Active', listSchedule });
    listSchedule.forEach((schedule) => {
      this.registerCronJob(schedule);
    });
  }

  registerCronJob(schedule: Schedule) {
    this.logger.log(`Se va registrar el cron Job ${schedule.name}`);
    const userSyncJob = new CronJob(
      Util.formatCronJob(schedule),
      this.sendNotificationBySchedule.bind(this, schedule),
    );
    this.schedulerRegistry.addCronJob(schedule.id.toString(), userSyncJob);
    userSyncJob.start();
  }

  async sendNotificationBySchedule(schedule: Schedule) {
    this.logger.log({ message: 'Se van enviar las notificaciones', schedule });
    const listTokens = await this.notificationService.findTokensBySchedule(schedule.id);
    listTokens.forEach((token) => {
      this.notificationService.sendNotification(
        token.tokenPush,
        Constants.NOTIFICATION_REMEMBER_ATTEDANCE,
      );
    });
  }

  async remove(id: number) {
    try {
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
}
