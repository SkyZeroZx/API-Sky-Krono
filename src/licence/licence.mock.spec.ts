import { CreateLicenceDto } from './dto/create-licence.dto';
import { UpdateLicenceDto } from './dto/update-licence.dto';
import { Licence } from './entities/licence.entity';

export class LicenceServiceMock {
  public save = jest.fn().mockReturnThis();

  public addSelect = jest.fn().mockReturnThis();

  public delete = jest.fn().mockReturnThis();

  public getRawMany = jest.fn().mockReturnThis();

  public findTokensByTask = jest.fn().mockReturnThis();

  public findTokensByUser = jest.fn().mockReturnThis();

  public innerJoin = jest.fn().mockReturnThis();

  public saveTaskToUser = jest.fn().mockReturnThis();

  public where = jest.fn().mockReturnThis();

  public select = jest.fn().mockReturnThis();

  public create = jest.fn().mockReturnThis();

  public update = jest.fn().mockReturnThis();

  public set = jest.fn().mockReturnThis();

  public execute = jest.fn().mockReturnThis();

  public from = jest.fn().mockReturnThis();

  public addUserToTask = jest.fn().mockReturnThis();

  public removeUserToTask = jest.fn().mockReturnThis();

  public findByUser = jest.fn().mockReturnThis();

  public createQueryBuilder = jest.fn(() => ({
    where: this.where,
    select: this.select,
    addSelect: this.addSelect,
    getRawMany: this.getRawMany,
    innerJoin: this.innerJoin,
    update: this.update,
    set: this.set,
    execute: this.execute,
  }));

  public findAll = jest.fn().mockReturnThis();
  public remove = jest.fn().mockReturnThis();
  public static readonly createLicenceDto: CreateLicenceDto = {
    description: 'Mock Description',
    dateRange: [new Date(), new Date()],
    codUser: 1,
  };

  public static readonly updateLicenceDto: UpdateLicenceDto = {
    id: 2,
    codUser: 1,
    description: 'Mock Description Update',
    dateRange: [new Date(), new Date()],
  };

  public static readonly licence: Licence = {
    id: 1,
    codUser: 1,
    description: 'Mock Description',
    dateInit: new Date(),
    dateEnd: new Date(),
  };
}
