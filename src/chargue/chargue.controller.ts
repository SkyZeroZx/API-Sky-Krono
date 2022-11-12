import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorator';
import { GenericResponse } from '../common/swagger/response';
import { ChargueService } from './chargue.service';
import { CreateChargueDto } from './dto/create-chargue.dto';
import { UpdateChargueDto } from './dto/update-chargue.dto';

@ApiTags('Chargue')
@ApiBearerAuth()
@Auth('admin')
@Controller('chargue')
export class ChargueController {
  constructor(private readonly chargueService: ChargueService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo Chargue' })
  @ApiResponse(GenericResponse.response)
  create(@Body() createChargueDto: CreateChargueDto) {
    return this.chargueService.create(createChargueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Chargue' })
  findAll() {
    return this.chargueService.findAll();
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar un Chargue' })
  @ApiResponse(GenericResponse.response)
  update(@Body() updateChargueDto: UpdateChargueDto) {
    return this.chargueService.update(updateChargueDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimiar un Chargue' })
  @ApiResponse(GenericResponse.response)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.chargueService.remove(id);
  }
}
