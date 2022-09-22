import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Constant } from '../common/constants/Constant';
import { CreateChargueDto } from './dto/create-chargue.dto';
import { UpdateChargueDto } from './dto/update-chargue.dto';
import { Chargue } from './entities/chargue.entity';

@Injectable()
export class ChargueService {
  private readonly logger = new Logger(ChargueService.name);
  constructor(
    @InjectRepository(Chargue)
    private readonly chargueRepository: Repository<Chargue>,
  ) {}

  async create(createChargueDto: CreateChargueDto) {
    this.logger.log({ message: 'Creando un nuevo Chargue', createChargueDto });
    try {
      await this.chargueRepository.save(createChargueDto);
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al crear el chargue', error });
      throw new InternalServerErrorException('Sucedio un error al crear el chargue');
    }
    return {
      message: Constant.MENSAJE_OK,
      info: 'Chargue registrado exitosamente',
    };
  }

  async findAll() {
    this.logger.log('Listando Chargues');
    return this.chargueRepository.find();
  }

  async update(updateChargueDto: UpdateChargueDto) {
    this.logger.log({ message: 'Actualizando Chargue', updateChargueDto });
    try {
      const { affected } = await this.chargueRepository.update(
        { id: updateChargueDto.codChargue },
        {
          name: updateChargueDto.name,
          description: updateChargueDto.description,
        },
      );

      if (affected == 1) {
        this.logger.log('Se actualizo satisfactoriamente el Chargue');
        return { message: Constant.MENSAJE_OK, info: 'Se actualizo exitosamente el chargue' };
      }

      this.logger.warn('Sucedio un error al actualizar el chargue');
      throw new InternalServerErrorException('Sucedio un error al actualizar el chargue');
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al intentar actualizar el chargue', error });
      throw new InternalServerErrorException('Sucedio un error al actualizar el chargue');
    }
  }

  async remove(id: number) {
    try {
      await this.chargueRepository.delete(id);
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al eliminar al eliminar el chargue', error });
      throw new InternalServerErrorException({
        message: 'Sucedio un error al eliminar el chargue',
      });
    }

    this.logger.log(`Se elimino exitosamente el chargue ${id}`);
    return {
      message: Constant.MENSAJE_OK,
      info: 'Se elimino exitosamente el chargue',
    };
  }
}
