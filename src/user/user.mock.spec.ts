import { Constants } from '../common/constants/Constant';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

export class UserServiceMock {
  public async save(_dto: any): Promise<any> {
    return UserServiceMock.userMock;
  }

  public uploadFile = jest.fn().mockReturnThis();
  public innerJoin = jest.fn().mockReturnThis();
  public findAll = jest.fn().mockReturnThis();
  public getUserById = jest.fn().mockReturnThis();
  public remove = jest.fn().mockReturnThis();
  public savePhotoUser = jest.fn().mockReturnThis();
  public find = jest.fn().mockReturnThis();
  public create = jest.fn().mockReturnThis();
  public findOneOrFail = jest.fn().mockReturnThis();
  public delete = jest.fn().mockReturnThis();
  public select = jest.fn().mockReturnThis();
  public cache = jest.fn().mockReturnThis();
  public getRawMany = jest.fn().mockReturnThis();
  // Metodo mockeado de TypeORM createQueryBuilder
  public createQueryBuilder = jest.fn(() => ({
    where: this.where,
    select: this.select,
    addSelect: this.addSelect,
    getOne: this.getOne,
    offset: this.offset,
    limit: this.limit,
    update: this.update,
    set: this.set,
    cache: this.cache,
    execute: this.execute,
    innerJoin: this.innerJoin,
    getRawMany: this.getRawMany,
  }));

  // Mockeo para funciones del QueryBuilder
  public where = jest.fn().mockReturnThis();
  public addSelect = jest.fn().mockReturnThis();
  public getOne = jest.fn().mockReturnThis();
  public offset = jest.fn().mockReturnThis();
  public limit = jest.fn().mockReturnThis();
  public update = jest.fn().mockReturnThis();
  public set = jest.fn().mockReturnThis();
  public execute = jest.fn().mockReturnThis();

  // Mockeo de objetos
  public static readonly mockCreateDto: CreateUserDto = {
    username: 'SkyZeroZx',
    name: 'Jaime',
    motherLastName: 'Burgos',
    fatherLastName: 'Tejada',
    role: 'Admin',
    codChargue: 0,
    codSchedule: 0,
    phone: '',
  };

  public static readonly userMock: User = {
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
    hashPassword: function (): Promise<void> {
      return;
    },
    firstLoginStatus: function (): Promise<void> {
      return;
    },
    codChargue: 0,
    codSchedule: 0,
    photo: '',
    phone: '',
  };

  public static readonly mockResultOk = {
    message: Constants.MSG_OK,
  };

  public static readonly updateUser: UpdateUserDto = {
    id: 1,
    username: 'SkyZeroZx',
    name: 'Jaime',
    motherLastName: 'Burgos',
    fatherLastName: 'Tejada',
    role: 'Admin',
    status: 'CREADO',
  };

  public static readonly mockFile: any = {
    buffer: null,
  };

  public static readonly deleteUser: DeleteUserDto = {
    id: 1,
  };

  public static readonly mockFindAllUserData: User[] = [
    {
      id: 1,
      username: 'SkyZeroZx',
      name: 'Jaime',
      password: 'test1',
      motherLastName: 'Burgos',
      fatherLastName: 'Tejada',
      role: 'Admin',
      createdAt: new Date(),
      updateAt: new Date(),
      status: 'CREADO',
      firstLogin: false,
      hashPassword: Object,
      firstLoginStatus: Object,
      codChargue: 0,
      codSchedule: 0,
      phone: null,
      photo: null,
    },
    {
      id: 2,
      username: 'Test User 2',
      name: 'User',
      password: 'test2',
      motherLastName: 'User Materno 2',
      fatherLastName: 'Paterno 2',
      role: 'viewer',
      createdAt: new Date(),
      updateAt: new Date(),
      status: 'BLOQUEADO',
      firstLogin: false,
      hashPassword: Object,
      firstLoginStatus: Object,
      codChargue: 0,
      codSchedule: 0,
      phone: null,
      photo: null,
    },
  ];
}
