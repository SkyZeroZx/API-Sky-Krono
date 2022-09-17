import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { SendNotificacionDto } from './dto/send-notificacion.dto';

export class NotificationMockService {
  public save = jest.fn().mockReturnThis();

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
  public static readonly createNotificacionDto: CreateNotificacionDto = {
    tokenPush: 'TokenPush25',
  };

  public static readonly sendNotificacionDto: SendNotificacionDto = {
    users: [],
  };
}
