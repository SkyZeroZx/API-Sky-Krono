import { DeleteUserDto } from 'src/user/dto/delete-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import * as config from '../config-e2e.json';
const {
  users: {
    userUpdate: { username, id, status },
    userLoginOk: { username: usernameLoginOk },
  },
} = config.env;
export class UserMockE2E {
  static createUserNew: any;
  generateRandomString(length: number): string {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  static readonly createUserExist: CreateUserDto = {
    username: usernameLoginOk,
    name: 'Exist',
    motherLastName: 'Exist',
    fatherLastName: 'Exist',
    role: 'admin',
  };

  static readonly updateUserExist: UpdateUserDto = {
    id: id,
    username,
    password: '123456',
    status: status,
    name: 'TEST E2E API',
    motherLastName: 'TEST E2E API',
    fatherLastName: 'TEST E2E API',
    createdAt: new Date(),
    updateAt: new Date(),
    role: 'viewer',
    firstLogin: false,
    hashPassword: function (): Promise<void> {
      return;
    },
    firstLoginStatus: function (): Promise<void> {
      return;
    },
  };

  static readonly deleteUserDto: DeleteUserDto = {
    id: id,
  };

  readonly createUserNew: CreateUserDto = {
    username: `${this.generateRandomString(10)}@mail.com`,
    name: 'TEST E2E API',
    motherLastName: 'TEST E2E API',
    fatherLastName: 'TEST E2E API',
    role: 'viewer',
  };
}
