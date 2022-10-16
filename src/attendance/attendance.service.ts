import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Constants } from '../common/constants/Constant';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Attendance } from './entities/attendance.entity';
import { User } from '../user/entities/user.entity';
import { Util } from '../common/utils/util';
import { ScheduleService } from '../schedule/schedule.service';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(Attendance.name);
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly scheduleService: ScheduleService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto, user: User) {
    this.logger.log(`Creando un nuevo Attendance para el usuario ${user.name}`);
    const scheduleByUser = await this.scheduleService.findScheduleByUser(user.id);
    if (!Util.validateRegisterDate(scheduleByUser)) {
      throw new BadRequestException('Se encuentra fuera de horario');
    }

    try {
      const isLater = Util.isLater(scheduleByUser);
      const newAttendance = this.attendanceRepository.create({
        codUser: user.id,
        description: createAttendanceDto.description,
        isLater: isLater,
      });

      await this.attendanceRepository.save(newAttendance);
    } catch (error) {
      this.logger.error(
        `Sucedio un error al crear el Attendance para el usuario ${user.username}`,
        error,
      );
      throw new InternalServerErrorException('Sucedio un error al crear el Attendance');
    }

    return {
      message: Constants.MSG_OK,
      info: 'Attendance registrado exitosamente',
    };
  }

  async isActiveAttendance(user: User): Promise<boolean> {
    this.logger.log('Validando si es activo Attendance para el usuario', { ...user });
    try {
      const { isActive } = await this.attendanceRepository.findOneOrFail({
        where: { id: Util.formatDateId(), codUser: user.id },
      });
      this.logger.log({ message: `Attedance para el usuario es ${isActive}`, user });
      return isActive;
    } catch (error) {
      this.logger.error({
        message: `Sucedio un error al validar Attendance para el usuario ${user.name}`,
        error,
      });
      throw new InternalServerErrorException('Sucedio un error al validar Attendance');
    }
  }

  async update(user: User) {
    this.logger.log(`Actualizando Attedance para el usuario ${user.name}`);
    if (!(await this.isActiveAttendance(user))) {
      throw new BadRequestException('Ya fue actualizado su Attendance anteriormente');
    }

    try {
      const { affected } = await this.attendanceRepository
        .createQueryBuilder()
        .update(Attendance)
        .set({
          isActive: false,
        })
        .where('codUser = :codUser and id = :id', { codUser: user.id, id: Util.formatDateId() })
        .execute();
      if (affected == 1) {
        this.logger.log('Se actualizo exitosamente el Attendance');
        return { message: Constants.MSG_OK, info: 'Se registro exitosamente su salida' };
      }
      this.logger.warn(`Sucedio un error al actualizar el Attendance`);
      throw new InternalServerErrorException('Sucedio un error al actualizar Attendance');
    } catch (error) {
      this.logger.error({
        message: `Sucedio un error al actualizar Attendance para el usuario ${user.name}`,
        error,
      });
      throw new InternalServerErrorException('Sucedio un error al actualizar Attendance');
    }
  }

  async findOne(user: User) {
    try {
      return await this.attendanceRepository.findOneBy({
        codUser: user.id,
        id: Util.formatDateId(),
      });
    } catch (error) {
      this.logger.error({
        message: `Sucedio un error al buscar el Attendance del usuario ${user.name}`,
        error,
      });
      throw new InternalServerErrorException('Sucedio un error al buscar el Attendance');
    }
  }

  async historyAttendance({ id }: User) {
    const listHistoryStatusAttendance = await this.attendanceRepository
      .createQueryBuilder('ATTENDANCE')
      .select('ATTENDANCE.date', 'date')
      .addSelect('ATTENDANCE.isActive', 'isActive')
      .addSelect('ATTENDANCE.isLater', 'isLater')
      .addSelect('ATTENDANCE.isAbsent', 'isAbsent')
      .addSelect('ATTENDANCE.isDayOff', 'isDayOff')
      .innerJoin(User, 'USER', 'USER.id = ATTENDANCE.codUser')
      .where('USER.id =:id', { id: id })
      .orderBy('ATTENDANCE.date', 'DESC')
      .limit(14)
      .getRawMany();
    return { currentDate: Util.formatLocalDate(), listHistoryStatusAttendance };
  }
}
