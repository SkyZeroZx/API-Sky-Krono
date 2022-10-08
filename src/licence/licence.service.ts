import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Constants } from '../common/constants/Constant';
import { User } from '../user/entities/user.entity';
import { CreateLicenceDto } from './dto/create-licence.dto';
import { UpdateLicenceDto } from './dto/update-licence.dto';
import { Licence } from './entities/licence.entity';

@Injectable()
export class LicenceService {
  private readonly logger = new Logger(LicenceService.name);
  constructor(
    @InjectRepository(Licence)
    private readonly licenceRepository: Repository<Licence>,
  ) {}

  async create(createLicenceDto: CreateLicenceDto) {
    this.logger.log({ message: 'Creando licencia ', createLicenceDto });
    try {
      const newLicence = this.licenceRepository.create({
        codUser: createLicenceDto.codUser,
        description: createLicenceDto.description,
        dateInit: createLicenceDto.dateRange[0],
        dateEnd: createLicenceDto.dateRange[1],
      });
      await this.licenceRepository.save(newLicence);
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al registrar la licencia', error });
      throw new InternalServerErrorException('Sucedio un error al registrar la licencia');
    }

    this.logger.log('Licencia registrada exitosamente');

    return {
      message: Constants.MSG_OK,
      info: 'Licencia registradada exitosamente',
    };
  }

  async findAll() {
    return this.licenceRepository
      .createQueryBuilder('LICENCE')
      .select('LICENCE.id', 'id')
      .addSelect('LICENCE.codUser', 'codUser')
      .addSelect('LICENCE.description', 'description')
      .addSelect('LICENCE.dateInit', 'dateInit')
      .addSelect('LICENCE.dateEnd', 'dateEnd')
      .addSelect(
        'CONCAT (USER.name," ",USER.fatherLastName , " ",USER.motherLastName )',
        'fullName',
      )
      .innerJoin(User, 'USER', 'USER.id = LICENCE.codUser')
      .getRawMany();
  }

  async update(updateLicenceDto: UpdateLicenceDto) {
    this.logger.log({ message: 'Actualizando licencia ', updateLicenceDto });
    try {
      const updateLicence = this.licenceRepository.create({
        codUser: updateLicenceDto.codUser,
        description: updateLicenceDto.description,
        dateInit: updateLicenceDto.dateRange[0],
        dateEnd: updateLicenceDto.dateRange[1],
      });
      const { affected } = await this.licenceRepository.update(
        { id: updateLicenceDto.id },
        updateLicence,
      );
      if (affected > 0) {
        return { message: Constants.MSG_OK, info: 'Tarea eliminada exitosamente' };
      }
      this.logger.warn('No se encontro licencia a actualizar');
      throw new InternalServerErrorException('Sucedio un error al actualizar la licencia');
    } catch (error) {
      throw new InternalServerErrorException('Sucedio un error al actualizar la licencia');
    }
  }

  async remove(id: number) {
    this.logger.log(`Eliminando licencia codigo ${id}`);
    try {
      await this.licenceRepository.delete(id);
    } catch (error) {
      this.logger.error({ message: 'Sucedio un error al eliminar la licencia', error });
      throw new InternalServerErrorException('Sucedio un error al eliminar la licencia');
    }
    this.logger.log('Se elimino exitosamente la licencia');
    return { message: Constants.MSG_OK, info: 'Se elimino exitosamente la licencia' };
  }
}
