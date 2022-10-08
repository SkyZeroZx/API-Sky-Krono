import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { LicenceService } from './licence.service';
import { CreateLicenceDto } from './dto/create-licence.dto';
import { UpdateLicenceDto } from './dto/update-licence.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorator';
import { GenericResponse, LicenceResponse } from '../common/swagger/response';

@ApiTags('Licence')
@ApiBearerAuth()
@Auth('admin')
@Controller('licence')
export class LicenceController {
  constructor(private readonly licenceService: LicenceService) {}

  @Post()
  @ApiOperation({ summary: 'Creación de licencia para usuario' })
  @ApiResponse(GenericResponse.response)
  create(@Body() createLicenceDto: CreateLicenceDto) {
    return this.licenceService.create(createLicenceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas las licencias de los usuarios' })
  @ApiResponse(LicenceResponse.listLicence)
  findAll() {
    return this.licenceService.findAll();
  }

  @Patch()
  @ApiOperation({ summary: 'Actualiza la licencia de un usuario' })
  @ApiResponse(GenericResponse.response)
  update(@Body() updateLicenceDto: UpdateLicenceDto) {
    return this.licenceService.update(updateLicenceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina la licencia de un usuario' })
  @ApiResponse(GenericResponse.response)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.licenceService.remove(id);
  }
}
