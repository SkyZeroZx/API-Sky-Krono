import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User as UserEntity } from '../user/entities/user.entity';
import { UserDecorator as User } from '../common/decorators/user.decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Registro de hora de entrada del usuario logeado' })
  create(@Body() createAttendanceDto: CreateAttendanceDto, @User() user: UserEntity) {
    return this.attendanceService.create(createAttendanceDto, user);
  }
  /*
  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }*/
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Determina el estado del Attendance del dia' })
  findOne(@User() user: UserEntity) {
    return this.attendanceService.findOne(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/history')
  @ApiOperation({ summary: 'Retorna el historial de los ultimas 14 asistencias para el usuario logeado' })
  historyAttendance(@User() user: UserEntity) {
    //TODO RETURN LAST 2 WEEKS FOR LOGGIN USER
    return this.attendanceService.historyAttendance(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  @ApiOperation({ summary: 'Registro de hora de salida del usuario logeado' })
  update(@User() user: UserEntity) {
    return this.attendanceService.update(user);
  }
}
