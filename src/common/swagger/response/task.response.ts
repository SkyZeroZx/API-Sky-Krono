import { getSchemaPath } from '@nestjs/swagger';
import { User as UserEntity } from '../../../user/entities/user.entity';
export class TaskResponse {
  public static readonly genericReponse = {
    status: 201,
    description: 'Repuesta del servicio exitoso',
    schema: {
      properties: {
        message: { type: 'string', description: 'Mensaje de respuesta exitoso' },
        info: { type: 'string', description: 'Informacion relacionada' },
      },
    },
  };

  public static readonly getUserByTask = {
    status: 201,
    description: 'Devolucion exitosa',
    schema: {
      example: [
        {
          id: 27,
          title: 'TAREA 5',
          description: 'TAREA DESCRIPTION',
          codType: 1,
          backgroundColor: 'rgba(16,183,89, .25)',
          borderColor: '#10b759',
          display: 'BLOCK',
          start: '2022-07-20T07:00:00',
          end: '2022-07-20T14:00:00',
          startDate: '2022-07-20',
          endDate: '2022-07-20',
        },
        {
          id: 34,
          title: 'Create',
          description: ' Hcyct',
          codType: 1,
          backgroundColor: 'rgba(16,183,89, .25)',
          borderColor: '#10b759',
          display: 'BLOCK',
          start: '2022-07-22T07:00:00',
          end: '2022-07-22T14:00:00',
          startDate: '2022-07-22',
          endDate: '2022-07-22',
        },
      ],
    },
  };

  public static readonly bodyGetTaskByUser = {
    schema: {
      properties: {
        id: { type: 'string', description: 'ID del usuario' },
      },
    },
  };

  public static readonly getTaskByUser = {
    status: 200,
    description: 'Devolucion exitosa',
    schema: {
      type: 'array',
      example: [
        {
          id: 27,
          title: 'TAREA 5',
          description: 'TAREA DESCRIPTION',
          codType: 1,
          backgroundColor: 'rgba(16,183,89, .25)',
          borderColor: '#10b759',
          display: 'BLOCK',
          start: '2022-07-20T07:00:00',
          end: '2022-07-20T14:00:00',
          startDate: '2022-07-20',
          endDate: '2022-07-20',
        },
        {
          id: 34,
          title: 'Create',
          description: ' Hcyct',
          codType: 1,
          backgroundColor: 'rgba(16,183,89, .25)',
          borderColor: '#10b759',
          display: 'BLOCK',
          start: '2022-07-22T07:00:00',
          end: '2022-07-22T14:00:00',
          startDate: '2022-07-22',
          endDate: '2022-07-22',
        },
      ],
    },
  };

  public static readonly responseFindAll = {
    status: 200,
    description: 'Devolucion exitosa',
    schema: {
      type: 'array',
      example: [
        {
          id: 27,
          title: 'TAREA 5',
          description: 'TAREA DESCRIPTION',
          codType: 1,
          backgroundColor: 'rgba(16,183,89, .25)',
          borderColor: '#10b759',
          display: 'BLOCK',
          start: '2022-07-20T07:00:00',
          end: '2022-07-20T14:00:00',
          startDate: '2022-07-20',
          endDate: '2022-07-20',
        },
        {
          id: 34,
          title: 'Create',
          description: ' Hcyct',
          codType: 1,
          backgroundColor: 'rgba(16,183,89, .25)',
          borderColor: '#10b759',
          display: 'BLOCK',
          start: '2022-07-22T07:00:00',
          end: '2022-07-22T14:00:00',
          startDate: '2022-07-22',
          endDate: '2022-07-22',
        },
      ],
    },
  };
}
