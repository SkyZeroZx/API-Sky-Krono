import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LicenceService } from './licence.service';
import { CreateLicenceDto } from './dto/create-licence.dto';
import { UpdateLicenceDto } from './dto/update-licence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('licence')
export class LicenceController {
  constructor(private readonly licenceService: LicenceService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createLicenceDto: CreateLicenceDto) {
    return this.licenceService.create(createLicenceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.licenceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.licenceService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(@Body() updateLicenceDto: UpdateLicenceDto) {
    console.log('update' , updateLicenceDto)
    return this.licenceService.update(updateLicenceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.licenceService.remove(+id);
  }
}
