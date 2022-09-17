import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('SkyCalendar')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getName(): string {
    return this.appService.getName();
  }
}
