import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User as UserEntity } from '../user/entities/user.entity';
import { UserDecorator as User } from '../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Util } from '../common/utils/util';
import { Auth } from '../common/decorators/auth.decorator';
import { GenericResponse } from '../common/swagger/response';

@ApiTags('Schedule')
@ApiBearerAuth()
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Auth('admin')
  @Post()
  @ApiOperation({ summary: 'Crea un nuevo Schedule' })
  @ApiResponse(GenericResponse.response)
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Auth('admin')
  @Get()
  @ApiOperation({ summary: 'Lista todos los Schedule' })
  findAll() {
    return this.scheduleService.findAll();
  }

  @Auth('admin')
  @Patch()
  @ApiOperation({ summary: 'Actualiza un Schedule' })
  @ApiResponse(GenericResponse.response)
  update(@Body() updateScheduleDto: UpdateScheduleDto) {
    return this.scheduleService.update(updateScheduleDto);
  }

  @Auth('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un Schedule' })
  @ApiResponse(GenericResponse.response)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user')
  @ApiOperation({ summary: 'Obtiene el Schedule del usuario logeado' })
  async findScheduleByUser(@User() user: UserEntity) {
    const schedule = await this.scheduleService.findScheduleByUser(user.id);
    return { dayIsValid: Util.validateRegisterDate(schedule), schedule };
  }
}
