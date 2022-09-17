import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constant } from '../common/constants/Constant';
import { TaskServiceMock } from '../task/task.mock.spec';
import { TaskToUser } from '../task_to_user/entities/task_to_user.entity';
import { User } from '../user/entities/user.entity';
import { UserServiceMock } from '../user/user.mock.spec';
import { Notificacion } from './entities/notificacion.entity';
import { NotificacionService } from './notificacion.service';
import { NotificationMockService } from './notification.mock.spec';
import * as webpush from 'web-push';
describe('NotificacionService', () => {
  let service: NotificacionService;
  let mockService: NotificationMockService = new NotificationMockService();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionService,
        {
          provide: getRepositoryToken(Notificacion),
          useValue: mockService,
        },
      ],
    }).compile();

    service = module.get<NotificacionService>(NotificacionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Validamos suscribeNotification OK', async () => {
    // Creamos nuestros espias y mocks
    const spyFindAndCount = jest.spyOn(mockService, 'findAndCount').mockResolvedValueOnce([[], 1]);
    const spySave = jest.spyOn(mockService, 'save');
    // Llamamos nuestro servicio a evaluar
    const suscribeNotificationOkNotSave = await service.suscribeNotification(
      1,
      NotificationMockService.createNotificacionDto,
    );

    expect(suscribeNotificationOkNotSave.message).toEqual(Constant.MENSAJE_OK);
    expect(spySave).not.toBeCalled();
    expect(spyFindAndCount).toBeCalledWith({
      where: {
        codUser: 1,
        tokenPush: NotificationMockService.createNotificacionDto.tokenPush,
      },
    });

    // Validamos el caso cuando se registrar y se llame a save
    spyFindAndCount.mockResolvedValueOnce([[], 0]);
    const suscribeNotificationOkSave = await service.suscribeNotification(
      1,
      NotificationMockService.createNotificacionDto,
    );
    expect(spySave).toBeCalled();
    expect(spyFindAndCount).toHaveBeenNthCalledWith(2, {
      where: {
        codUser: 1,
        tokenPush: NotificationMockService.createNotificacionDto.tokenPush,
      },
    });
    expect(suscribeNotificationOkSave.message).toEqual(Constant.MENSAJE_OK);
  });

  it('Validamos suscribeNotification Error', async () => {
    //Validamos el primer caso de error de findAndCount
    const spyFindAndCount = jest
      .spyOn(mockService, 'findAndCount')
      .mockRejectedValueOnce(new Error('Algo salio mal'));
    const spySave = jest.spyOn(mockService, 'save');
    await expect(
      service.suscribeNotification(1, NotificationMockService.createNotificacionDto),
    ).rejects.toThrowError(
      new InternalServerErrorException({ message: 'Sucedio un error al guardar el token' }),
    );
    expect(spyFindAndCount).toBeCalled();
    expect(spySave).not.toBeCalled();
    // Validamos el segundo caso de error cuando save lance una excepcion
    spyFindAndCount.mockResolvedValueOnce([[], 0]);
    spySave.mockRejectedValueOnce(new Error('Algo salio mal'));

    await expect(
      service.suscribeNotification(1, NotificationMockService.createNotificacionDto),
    ).rejects.toThrowError(
      new InternalServerErrorException({ message: 'Sucedio un error al guardar el token' }),
    );
    expect(spySave).toBeCalled();
    expect(spyFindAndCount).toBeCalledTimes(2);
  });

  it('Validamos sendNotification ', async () => {
    const tokenPush: string = '{"hello":"world"}';
    const message: Object = { hello: 'world' };
    const spyWebPush = jest.spyOn(webpush, 'sendNotification').mockResolvedValue(null);
    await service.sendNotification(tokenPush, message);
    expect(spyWebPush).toBeCalledWith(JSON.parse(tokenPush), JSON.stringify(message));
    // Validamos el caso de entrar en catch
    spyWebPush.mockRejectedValueOnce(new Error('Algo salio mal'));
    expect(await service.sendNotification(tokenPush, message)).toBeUndefined();
  });

  it('Validamos findTokensByUser  ', async () => {
    const spyCreateQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyGetRawMany = jest.spyOn(mockService, 'getRawMany');

    // Llamamos nuestro servicio y le paso el codUser
    await service.findTokensByUser(1);
    expect(spyCreateQueryBuilder).toBeCalledWith('NOTIFICACION');
    expect(spySelect).toBeCalledWith('DISTINCT   (NOTIFICACION.tokenPush)', 'tokenPush');
    expect(spyInnerJoin).toBeCalledWith(User, 'USER', ' USER.id = NOTIFICACION.codUser');
    expect(spyWhere).toBeCalledWith('USER.id = :id', {
      id: 1,
    });
    expect(spyGetRawMany).toBeCalled();
  });

  it('Validamos findTokensByTask  ', async () => {
    const spyCreateQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyGetRawMany = jest.spyOn(mockService, 'getRawMany');
    // Llamamos nuestro servicio y le paso el codUser
    await service.findTokensByTask(1);
    expect(spyCreateQueryBuilder).toBeCalledWith('NOTIFICACION');
    expect(spySelect).toBeCalledWith('DISTINCT   (NOTIFICACION.tokenPush)', 'tokenPush');
    expect(spyInnerJoin).toHaveBeenNthCalledWith(
      1,
      User,
      'USER',
      ' USER.id = NOTIFICACION.codUser',
    );
    expect(spyInnerJoin).toHaveBeenNthCalledWith(
      2,
      TaskToUser,
      'TASK_TO_USER',
      ' TASK_TO_USER.codUser = USER.id',
    );
    expect(spyWhere).toBeCalledWith('TASK_TO_USER.codTask = :codTask', {
      codTask: 1,
    });
    expect(spyGetRawMany).toBeCalled();
  });

  it('Validamos registerTaskTokenByUser Ok', async () => {
    const spyFindTokensByUser = jest
      .spyOn(service, 'findTokensByUser')
      .mockResolvedValue(TaskServiceMock.tokenByUser);
    const spySendNotification = jest
      .spyOn(service, 'sendNotification')
      .mockImplementation(async () => {
        return;
      });
    const registerTaskTokenByUser = await service.registerTaskTokenByUser(
      UserServiceMock.mockFindAllUserData,
    );

    for (let i: number = 0; i < UserServiceMock.mockFindAllUserData.length; i++) {
      expect(spyFindTokensByUser).toHaveBeenNthCalledWith(
        i + 1,
        UserServiceMock.mockFindAllUserData[i].id,
      );
    }

    // Validamos las veces que se llamo send notificacion
    expect(spySendNotification).toBeCalledTimes(
      UserServiceMock.mockFindAllUserData.length * TaskServiceMock.tokenByUser.length,
    );
    expect(registerTaskTokenByUser.message).toEqual(Constant.MENSAJE_OK);
  });

  it('Validamos registerTaskTokenByUser Error', async () => {
    const spyFindTokensByUser = jest
      .spyOn(service, 'findTokensByUser')
      .mockImplementation(async () => {
        throw new Error('');
      });
    const spySendNotification = jest.spyOn(service, 'sendNotification');
    await expect(
      service.registerTaskTokenByUser(UserServiceMock.mockFindAllUserData),
    ).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al registrar tokens para la nueva tarea',
      }),
    );
    expect(spyFindTokensByUser).toBeCalled();
    expect(spySendNotification).not.toBeCalled();
    jest.clearAllMocks();

    // Ahora hacemos que nos retorne un valor nuestro findTokensByUser
    spyFindTokensByUser.mockResolvedValue(TaskServiceMock.tokenByUser);
    spySendNotification.mockImplementation(async () => {
      new Error('Sucedio Algo mal');
    });
    const noBlockErrorSendNotications = await service.registerTaskTokenByUser(
      UserServiceMock.mockFindAllUserData,
    );
    expect(noBlockErrorSendNotications.message).toEqual(Constant.MENSAJE_OK);
  });
});
