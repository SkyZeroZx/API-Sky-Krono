import { CreateTaskDto } from './dto/create-task.dto';
import { DeleteTaskDto } from './dto/delete-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export class TaskServiceMock {
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

  public sendNotification = jest.fn().mockReturnThis();

  public static readonly tokens: string[] = ['Token1', 'Token2', 'Token3'];

  public static readonly tokenByUser: any[] = [
    { tokePush: 'Token1' },
    { tokePush: 'Token2' },
    { tokePush: 'Token3' },
  ];

  public static readonly taskSave = {
    codTask: 1,
  };

  public static readonly taskFindAll: any[] = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      start: '2020-01-01T08:00:00',
      end: '2020-01-01T09:00:00',
      startDate: '2020-01-01',
      endDate: '2020-01-02',
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      start: '2022-01-01T08:00:00',
      end: '2022-01-01T09:00:00',
      startDate: '2022-01-01',
      endDate: '2022-01-02',
    },
  ];

  public static readonly createTaskDto: CreateTaskDto = {
    codType: 1,
    title: 'Sky Calendar',
    description: 'Awesome',
    dateRange: [new Date(), new Date()],
    users: [
      {
        id: 1,
        username: 'SkyZeroZx',
        name: 'Jaime',
        password: 'test1',
        motherLastName: 'Burgos',
        fatherLastName: 'Tejada',
        role: 'Admin',
        status: 'CREADO',
        firstLogin: true,
        createdAt: new Date(),
        updateAt: new Date(),
        codChargue: 0,
        codSchedule: 0,
        photo: '',
        phone: '',
        hashPassword: function (): Promise<void> {
          return;
        },
        firstLoginStatus: function (): Promise<void> {
          return;
        },
      },
      {
        id: 2,
        username: 'SkyBot',
        name: 'Sky',
        password: 'bot',
        motherLastName: 'Bot',
        fatherLastName: 'Bot',
        role: 'Admin',
        status: 'CREADO',
        firstLogin: true,
        createdAt: new Date(),
        updateAt: new Date(),
        codChargue: 0,
        codSchedule: 0,
        photo: '',
        phone: '',
        hashPassword: function (): Promise<void> {
          return;
        },
        firstLoginStatus: function (): Promise<void> {
          return;
        },
      },
    ],
  };

  public static readonly updateTaskDto: UpdateTaskDto = {
    codTask: 25,
    codType: 625,
    title: 'Sky Calendar',
    description: 'Awesome',
    dateRange: [new Date(), new Date()],
  };

  public static readonly findByTaskResults: any[] = [
    {
      id: 1,
      name: 'Juan',
      fatherLastName: 'Perez',
      motherLastName: 'Gonzalez',
    },
    {
      id: 2,
      name: 'Pepe',
      fatherLastName: 'Fulano',
      motherLastName: 'Quispe',
    },
  ];

  public static readonly deleteTaskDto: DeleteTaskDto = {
    codTask: 25,
  };
}
