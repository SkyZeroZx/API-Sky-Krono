import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Constant } from '../common/constants/Constant';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
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
    console.log('Is later', await this.validateIsLater(user));
    this.logger.log(`Creando un nuevo Attendance para el usuario ${user.name}`);
    /*if (!(await this.validateRegisterDate(user))) {
      throw new BadRequestException('Se encuentra fuera de horario');
    }*/

    try {
      const isLater = await this.validateIsLater(user);
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
      message: Constant.MENSAJE_OK,
      info: 'Attendance registrado exitosamente',
    };
  }

  async valiteIsActiveAttendance(user: User): Promise<boolean> {
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
    if (!(await this.valiteIsActiveAttendance(user))) {
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
        return { message: Constant.MENSAJE_OK, info: 'Se registro exitosamente su salida' };
      }
      this.logger.warn(`Sucedio un error al actualizar el Attendance`);
      return { message: 'Sucedio un error al actualizar el Attendance' };
    } catch (error) {
      this.logger.error({
        message: `Sucedio un error al actualizar Attendance para el usuario ${user.name}`,
        error,
      });
      throw new InternalServerErrorException('Sucedio un error al actualizar Attendance');
    }
  }

  findAll() {
    return `This action returns all attendance`;
  }

  async findOne(user: User) {
    /*   if (!(await this.validateRegisterDate(user))) {
      throw new BadRequestException('Se encuentra fuera de horario');
    }
*/
    try {
      return await this.attendanceRepository.findOneBy({
        codUser: user.id,
        id: Util.formatDateId(),
      });
     // console.log('toDateString ', Util.formatLocalDate());
     // return attendance ;
        //date: Util.formatLocalDate(),
        
        
    } catch (error) {
      this.logger.error({
        message: `Sucedio un error al buscar el Attendance del usuario ${user.name}`,
        error,
      });
      throw new InternalServerErrorException('Sucedio un error al buscar el Attendance');
    }
  }

  async validateIsLater(user: User) {
    const scheduleByUser = await this.scheduleService.findScheduleByUser(user.id);
    return Util.isLater(scheduleByUser);
  }

  async validateRegisterDate(user: User): Promise<boolean> {
    try {
      const scheduleByUser = await this.scheduleService.findScheduleByUser(user.id);
      if (Util.validateRegisterDate(scheduleByUser)) {
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error({
        message: `Sucedio un error al buscar al validar registro attendance para ${user.name}`,
        error,
      });
      throw new InternalServerErrorException('Sucedio un error al validar registro attendance');
    }
  }

  async historyAttendance({ id }: User) {
    const listHistoryStatusAttendance = await this.attendanceRepository
      .createQueryBuilder('ATTENDANCE')
      .select('ATTENDANCE.date', 'date')
      .addSelect('ATTENDANCE.isActive', 'isActive')
      .addSelect('ATTENDANCE.isLater', 'isLater')
      .addSelect('ATTENDANCE.isAbsent', 'isAbsent')
      .innerJoin(User, 'USER', 'USER.id = ATTENDANCE.codUser')
      .where('USER.id =:id', { id: id })
      .orderBy('ATTENDANCE.date', 'DESC')
      .limit(14)
      .getRawMany();
    return { currentDate: Util.formatLocalDate(), listHistoryStatusAttendance };
  }
}
