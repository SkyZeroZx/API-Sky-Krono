import {
  Body,
  Controller,
  Delete,
  Get,
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
import { GenericResponse } from '../common/swagger/response';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Type')
@ApiBearerAuth()
@Controller('type')
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @Auth('admin')
  @Post()
  @ApiOperation({ summary: 'Creación de un nuevo tipo' })
  @ApiResponse(GenericResponse.response)
  create(@Body() createTypeDto: CreateTypeDto) {
    return this.typeService.create(createTypeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Devolucion de todos los tipos' })
  @ApiResponse(TypeResponse.findAll)
  findAll() {
    return this.typeService.findAll();
  }

  @Auth('admin')
  @Patch()
  @ApiOperation({ summary: 'Actualización de un tipo' })
  @ApiResponse(GenericResponse.response)
  update(@Body() updateTypeDto: UpdateTypeDto) {
    return this.typeService.update(updateTypeDto);
  }

  @Auth('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo' })
  @ApiResponse(GenericResponse.response)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.typeService.remove(id);
  }
}
