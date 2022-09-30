import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TypeService } from './type.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TypeResponse } from '../common/swagger/response/type.response';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';

@ApiTags('Type')
@ApiBearerAuth()
@Controller('type')
export class TypeController {
  private readonly logger = new Logger(TypeController.name);
  constructor(private readonly typeService: TypeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Devolucion de todos los tipos' })
  @ApiResponse(TypeResponse.findAll)
  findAll() {
    return this.typeService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Creación de un nuevo tipo' })
  create(@Body() createTypeDto: CreateTypeDto) {
    return this.typeService.createType(createTypeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  @ApiOperation({ summary: 'Actualización de un tipo' })
  update(@Body() updateTypeDto: UpdateTypeDto) {
    return this.typeService.updateType(updateTypeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.typeService.deleteType(id);
  }
}
