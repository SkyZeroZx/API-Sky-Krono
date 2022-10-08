import { getSchemaPath } from '@nestjs/swagger';
import { User } from '../../../user/entities/user.entity';
export class UserReponse {
  public static readonly createUser = {
    status: 201,
    description: 'Creacion Exitoso',
    schema: {
      properties: {
        message: { type: 'string', description: 'Mensaje de creacion del usuario' },
        info: { type: 'string', description: 'Informacion adicional de la operacion' },
        user: { $ref: getSchemaPath(User), description: 'Usuario creado' },
      },
    },
  };

  public static readonly profile = {
    status: 201,
    description: 'Obtener perfil exitoso',
    schema: {
      $ref: getSchemaPath(User),
      example: {
        id: 30,
        username: 'jburgost@unac.edu.pe',
        role: 'admin',
        createdAt: '2022-08-05T21:11:58.379Z',
        updateAt: '2022-08-20T21:26:05.000Z',
        name: 'Admin',
        fatherLastName: 'Paterno',
        motherLastName: 'Materno',
        status: 'HABILITADO',
        firstLogin: false,
      },
    },
  };

  public static readonly findAll = {
    status: 200,
    description: 'Devolucion exitosa',
    schema: {
      type: 'array',
      properties: {
        users: { $ref: getSchemaPath(User) },
      },
      example: [
        {
          id: 30,
          username: 'jburgost@unac.edu.pe',
          role: 'admin',
          createdAt: '2022-08-05T21:11:58.379Z',
          updateAt: '2022-08-20T21:26:05.000Z',
          name: 'Admin',
          fatherLastName: 'Paterno',
          motherLastName: 'Materno',
          status: 'HABILITADO',
          firstLogin: false,
        },
        {
          id: 31,
          username: 'mysqlserver64@gmail.com',
          role: 'admin',
          createdAt: '2022-08-10T04:28:53.167Z',
          updateAt: '2022-08-10T04:28:53.167Z',
          name: 'UserCreate',
          fatherLastName: 'Create Paterno',
          motherLastName: 'Create Materno',
          status: 'CREADO',
          firstLogin: true,
        },
      ],
    },
  };
}
