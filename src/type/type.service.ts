import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Constant } from '../common/constants/Constant';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { Type } from './entities/type.entity';

@Injectable()
export class TypeService {
  private readonly logger = new Logger(TypeService.name);
  constructor(
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>,
  ) {}

  async findAll(): Promise<Type[]> {
    this.logger.log('Listando Types');
    return this.typeRepository.find();
  }

  async createType(createTypeDto: CreateTypeDto) {
    this.logger.log({ message: 'Creando nuevo tipo', createTypeDto });
    try {
      await this.typeRepository.save(createTypeDto);
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al crear nuevo tipo', error });
      throw new InternalServerErrorException('Sucedio un error al registrar nuevo tipo');
    }

    return {
      message: Constant.MENSAJE_OK,
      info: 'Type registrado exitosamente',
    };
  }

  async updateType(updateTypeDto: UpdateTypeDto) {
    this.logger.log({ message: 'Creando nuevo tipo', updateTypeDto });
    try {
      const updateSchedule = this.typeRepository.create(updateTypeDto);
      const { affected } = await this.typeRepository.update(
        { codType: updateTypeDto.codType },
        updateSchedule,
      );
      if (affected == 1) {
        this.logger.log('Se actualizo satisfactoriamente el Type');
        return { message: Constant.MENSAJE_OK, info: 'Se actualizo exitosamente el Type' };
      }
      this.logger.warn(`Sucedio un error al actualizar el Type`);
      throw new InternalServerErrorException('Sucedio un error al actualizar el Type');
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al crear nuevo tipo', error });
      throw new InternalServerErrorException('Sucedio un error al registrar nuevo tipo');
    }
  }

  async deleteType(codType: number) {
    try {
      await this.typeRepository.delete(codType);
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al eliminar al eliminar el Type', error });
      throw new InternalServerErrorException('Sucedio un error al eliminar el Type');
    }

    this.logger.log(`Se elimino exitosamente el Type ${codType}`);
    return {
      message: Constant.MENSAJE_OK,
      info: 'Se elimino exitosamente el Type',
    };
  }
}
