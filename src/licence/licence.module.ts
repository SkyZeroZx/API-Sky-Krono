import { Module } from '@nestjs/common';
import { LicenceService } from './licence.service';
import { LicenceController } from './licence.controller';
import { Licence } from './entities/licence.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Licence])],
  controllers: [LicenceController],
  providers: [LicenceService],
  exports: [LicenceService],
})
export class LicenceModule {}
