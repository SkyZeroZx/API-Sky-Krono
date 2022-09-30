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
import { LicenceService } from './licence.service';
import { CreateLicenceDto } from './dto/create-licence.dto';
import { UpdateLicenceDto } from './dto/update-licence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Licence')
@ApiBearerAuth()
@Controller('licence')
export class LicenceController {
  constructor(private readonly licenceService: LicenceService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Creación de licencia para usuario' })
  create(@Body() createLicenceDto: CreateLicenceDto) {
    return this.licenceService.create(createLicenceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Lista todas las licencias de los usuarios' })
  findAll() {
    return this.licenceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.licenceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  @ApiOperation({ summary: 'Actualiza la licencia de un usuario' })
  update(@Body() updateLicenceDto: UpdateLicenceDto) {
    console.log('update', updateLicenceDto);
    return this.licenceService.update(updateLicenceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Elimina la licencia de un usuario' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.licenceService.remove(id);
  }
}
