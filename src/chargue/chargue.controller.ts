import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChargueService } from './chargue.service';
import { CreateChargueDto } from './dto/create-chargue.dto';
import { UpdateChargueDto } from './dto/update-chargue.dto';

@ApiTags('Chargue')
@ApiBearerAuth()
@Controller('chargue')
export class ChargueController {
  private readonly logger = new Logger(ChargueController.name);
  constructor(private readonly chargueService: ChargueService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo Chargue' })
  create(@Body() createChargueDto: CreateChargueDto) {
    this.logger.log('Creando Chargue');
    return this.chargueService.create(createChargueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Chargue' })
  findAll() {
    this.logger.log('Listando Chargues');
    return this.chargueService.findAll();
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar un Chargue' })
  update(@Body() updateChargueDto: UpdateChargueDto) {
    this.logger.log('Actualizando Chargue');
    return this.chargueService.update(updateChargueDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimiar un Chargue' })
  remove(@Param('id') id: string) {
    this.logger.log('Elimiando Chargue');
    return this.chargueService.remove(+id);
  }
}
