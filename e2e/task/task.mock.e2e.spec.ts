import { CreateTaskDto } from '../../src/task/dto/create-task.dto';
import { DeleteTaskDto } from '../../src/task/dto/delete-task.dto';
import { TaskToUserDto } from '../../src/task_to_user/dto/task-to-user.dto';
import * as config from '../config-e2e.json';
const {
 
  users: { userLoginOk, userReseteado,userSuscrito },
}: any = config.env;

export class TaskMockServiceE2E {
  public save = jest.fn() ;

  public delete = jest.fn().mockReturnThis();

  public generateTokenWithAuthnWeb = jest.fn().mockReturnThis();

  public resetPassword = jest.fn();

  public saveNewPassword = jest.fn().mockReturnThis();

  public getRequest = jest.fn().mockReturnThis();
  // Is function for mock configService
  public get = jest.fn().mockReturnThis();

  public validateUser = jest.fn().mockReturnThis();

  public getUserById = jest.fn().mockReturnThis();

  public createQueryBuilder = jest.fn(() => ({
    where: this.where,
    select: this.select,
    addSelect: this.addSelect,
    innerJoin: this.innerJoin,
    getRawMany: this.getRawMany,
    execute: this.execute,
    getRawOne: this.getRawOne,
  }));

  public changePassword = jest.fn().mockReturnThis();

  public getUserAuthenticators = jest.fn().mockReturnThis();

  public getUserAuthenticatorsById = jest.fn().mockReturnThis();

  public getUserAuthenticatorsByUsername = jest.fn().mockReturnThis();

  public create = jest.fn();

  public findByEmail = jest.fn().mockReturnThis();

  public saveTaskToUser = jest.fn().mockReturnThis();

  public findAndCount = jest.fn().mockReturnThis();

  public removeUserToTask = jest.fn().mockReturnThis();

  public where = jest.fn().mockReturnThis();

  public select = jest.fn().mockReturnThis();

  public execute = jest.fn().mockReturnThis();

  public getRawMany = jest.fn().mockReturnThis();

  public innerJoin = jest.fn().mockReturnThis();

  public generateToken = jest.fn().mockReturnThis();

  public find = jest.fn().mockReturnThis();

  public addSelect = jest.fn().mockReturnThis();

  public getRawOne = jest.fn().mockReturnThis();

  public static readonly createTaskDto: CreateTaskDto = {
    codType: 1,
    title: 'Prueba E2E',
    description: 'Esto es una prueba E2E',
    dateRange: [new Date(), new Date()],
    users: [userLoginOk, userReseteado],
  };

  public static readonly taskToUserDto  :TaskToUserDto = {
    codUser: userSuscrito.id,
    codTask: 5
  }

  public static readonly deleteTaskDto : DeleteTaskDto = {
    codTask: 23
  }
}
