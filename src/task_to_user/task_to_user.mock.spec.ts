import { TaskToUserDto } from './dto/task-to-user.dto';

export class TaskToUserMock {
  public save = jest.fn().mockReturnThis();

  public delete = jest.fn().mockReturnThis();
  public createQueryBuilder = jest.fn(() => ({
    where: this.where,
    select: this.select,
    getRawMany: this.getRawMany,
    execute: this.execute,
  }));

  public saveTaskToUser = jest.fn().mockReturnThis();

  public removeUserToTask = jest.fn().mockReturnThis();
  public where = jest.fn().mockReturnThis();
  public select = jest.fn().mockReturnThis();
  public execute = jest.fn().mockReturnThis();
  public getRawMany = jest.fn().mockReturnThis();
  public static readonly taskToUserDto: TaskToUserDto = {
    codUser: 5,
    codTask: 5,
  };
}
