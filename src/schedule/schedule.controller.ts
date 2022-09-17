import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { User as UserEntity } from '../user/entities/user.entity';
import { UserDecorator as User } from '../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Util } from '../common/utils/util';

@ApiTags('Schedule')
@ApiBearerAuth()
@Controller('schedule')
export class ScheduleController {
  private readonly logger = new Logger(ScheduleController.name);
  constructor(private readonly scheduleService: ScheduleService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crea un nuevo Schedule' })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    this.logger.log('Creando nuevo Schedule');
    return this.scheduleService.create(createScheduleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Lista todos los Schedule' })
  findAll() {
    this.logger.log('Listando Schedule');
    return this.scheduleService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  @ApiOperation({ summary: 'Permite editar un Schedule' })
  update(@Body() updateScheduleDto: UpdateScheduleDto) {
    this.logger.log('Actualizando Schedule');
    return this.scheduleService.update(updateScheduleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un Schedule' })
  remove(@Param('id') id: string) {
    this.logger.log('Eliminando Schedule');
    return this.scheduleService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user')
  @ApiOperation({ summary: 'Obtiene el Schedule del usuario logeado' })
  async findScheduleByUser(@User() user: UserEntity) {
    this.logger.log({ message: 'Obteniendo Schedule del usuario', user });
    const schedule = await this.scheduleService.findScheduleByUser(user.id);
    return { dayIsValid: Util.validateRegisterDate(schedule) , schedule };
  }
}
