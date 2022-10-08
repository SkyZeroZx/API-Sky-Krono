import { CreateChargueDto } from './dto/create-chargue.dto';
import { UpdateChargueDto } from './dto/update-chargue.dto';
import { Chargue } from './entities/chargue.entity';

export class ChargueServiceMock {
  public create = jest.fn().mockReturnThis();
  public save = jest.fn().mockReturnThis();
  public update = jest.fn().mockReturnThis();
  public find = jest.fn().mockReturnThis();
  public delete = jest.fn().mockReturnThis();
  public createQueryBuilder = jest.fn(() => ({
    where: this.where,
    select: this.select,
    innerJoin: this.innerJoin,
    getRawMany: this.getRawMany,
    execute: this.execute,
  }));

  public saveTaskToUser = jest.fn().mockReturnThis();
  public findAndCount = jest.fn().mockReturnThis();
  public removeUserToTask = jest.fn().mockReturnThis();
  public where = jest.fn().mockReturnThis();
  public select = jest.fn().mockReturnThis();
  public execute = jest.fn().mockReturnThis();
  public getRawMany = jest.fn().mockReturnThis();
  public innerJoin = jest.fn().mockReturnThis();
  public findAll = jest.fn().mockReturnThis();
  public remove = jest.fn().mockReturnThis();

  public static readonly createChargueDto: CreateChargueDto = {
    description: 'Mock Description',
    name: 'Mock Name',
  };

  public static readonly updateChargueDto: UpdateChargueDto = {
    codChargue: 1,
    name: '',
    description: '',
  };

  public static readonly chargue: Chargue = {
    id: 1,
    name: '',
    description: '',
  };
}
