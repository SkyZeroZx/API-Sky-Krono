import { Controller, Get, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User as UserEntity } from '../user/entities/user.entity';
import { UserDecorator as User } from '../common/decorators/user.decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AttendanceResponse, GenericResponse } from '../common/swagger/response';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Registro de hora de entrada del usuario logeado' })
  @ApiResponse(GenericResponse.response)
  create(@Body() createAttendanceDto: CreateAttendanceDto, @User() user: UserEntity) {
    return this.attendanceService.create(createAttendanceDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Determina el estado del Attendance del dia' })
  @ApiResponse(AttendanceResponse.findOne)
  findOne(@User() user: UserEntity) {
    return this.attendanceService.findOne(user);
  }

  @Get('/history')
  @ApiOperation({ summary: 'Historial ultimos 14 asistencias del usuario logeado' })
  @ApiResponse(AttendanceResponse.historyAttendance)
  historyAttendance(@User() user: UserEntity) {
    return this.attendanceService.historyAttendance(user);
  }

  @Patch()
  @ApiOperation({ summary: 'Registro de hora de salida del usuario logeado' })
  @ApiResponse(GenericResponse.response)
  update(@User() user: UserEntity) {
    return this.attendanceService.update(user);
  }
}
