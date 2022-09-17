import { Module } from '@nestjs/common';
import { ChargueService } from './chargue.service';
import { ChargueController } from './chargue.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chargue } from './entities/chargue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chargue])],
  controllers: [ChargueController],
  providers: [ChargueService]
})
export class ChargueModule {}
