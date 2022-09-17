import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { TypeService } from './type.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TypeResponse } from '../common/swagger/response/type.response';

@ApiTags('Type Task')
@ApiBearerAuth()
@Controller('type')
export class TypeController {
  private readonly logger = new Logger(TypeController.name);
  constructor(private readonly typeService: TypeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Devolucion de todos los tipos de tareas' })
  @ApiResponse(TypeResponse.findAll)
  async findAll() {
    this.logger.log('Listando Types');
    return   this.typeService.findAll();
  }
}
