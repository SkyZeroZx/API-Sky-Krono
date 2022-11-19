import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constants } from '../common/constants/Constant';
import { TaskServiceMock } from '../task/task.mock.spec';
import { TaskToUser } from '../task_to_user/entities/task_to_user.entity';
import { User } from '../user/entities/user.entity';
import { UserServiceMock } from '../user/user.mock.spec';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationMockService } from './notification.mock.spec';
import webpush from 'web-push';
import { Schedule } from '../schedule/entities/schedule.entity';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockService: NotificationMockService = new NotificationMockService();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockService,
        },
      ],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(notificationService).toBeDefined();
  });

  it('Validate suscribeNotification OK', async () => {
    // Creamos nuestros espias y mocks
    const spyFindAndCount = jest.spyOn(mockService, 'findAndCount').mockResolvedValueOnce([[], 1]);
    const spySave = jest.spyOn(mockService, 'save');
    // Llamamos nuestro servicio a evaluar
    const suscribeNotificationOkNotSave = await notificationService.suscribeNotification(
      1,
      NotificationMockService.createNotificationDto,
    );

    expect(suscribeNotificationOkNotSave.message).toEqual(Constants.MSG_OK);
    expect(spySave).not.toBeCalled();
    expect(spyFindAndCount).toBeCalledWith({
      where: {
        codUser: 1,
        tokenPush: NotificationMockService.createNotificationDto.tokenPush,
      },
    });

    // Validamos el caso cuando se registrar y se llame a save
    spyFindAndCount.mockResolvedValueOnce([[], 0]);
    const suscribeNotificationOkSave = await notificationService.suscribeNotification(
      1,
      NotificationMockService.createNotificationDto,
    );
    expect(spySave).toBeCalled();
    expect(spyFindAndCount).toHaveBeenNthCalledWith(2, {
      where: {
        codUser: 1,
        tokenPush: NotificationMockService.createNotificationDto.tokenPush,
      },
    });
    expect(suscribeNotificationOkSave.message).toEqual(Constants.MSG_OK);
  });

  it('Validate suscribeNotification Error', async () => {
    //Validamos el primer caso de error de findAndCount
    const spyFindAndCount = jest
      .spyOn(mockService, 'findAndCount')
      .mockRejectedValueOnce(new Error('Algo salio mal'));
    const spySave = jest.spyOn(mockService, 'save');
    await expect(
      notificationService.suscribeNotification(1, NotificationMockService.createNotificationDto),
    ).rejects.toThrowError(
      new InternalServerErrorException({ message: 'Sucedio un error al guardar el token' }),
    );
    expect(spyFindAndCount).toBeCalled();
    expect(spySave).not.toBeCalled();
    // Validamos el segundo caso de error cuando save lance una excepcion
    spyFindAndCount.mockResolvedValueOnce([[], 0]);
    spySave.mockRejectedValueOnce(new Error('Algo salio mal'));

    await expect(
      notificationService.suscribeNotification(1, NotificationMockService.createNotificationDto),
    ).rejects.toThrowError(
      new InternalServerErrorException({ message: 'Sucedio un error al guardar el token' }),
    );
    expect(spySave).toBeCalled();
    expect(spyFindAndCount).toBeCalledTimes(2);
  });

  it('Validate sendNotification ', async () => {
    const tokenPush: string = '{"hello":"world"}';
    const message: Object = { hello: 'world' };
    const spyWebPush = jest.spyOn(webpush, 'sendNotification').mockResolvedValue(null);
    await notificationService.sendNotification(tokenPush, message);
    expect(spyWebPush).toBeCalledWith(JSON.parse(tokenPush), JSON.stringify(message));
    // Validamos el caso de entrar en catch
    spyWebPush.mockRejectedValueOnce(new Error('Algo salio mal'));
    expect(await notificationService.sendNotification(tokenPush, message)).toBeUndefined();
  });

  it('Validate findTokensByUser  ', async () => {
    const spyCreateQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyGetRawMany = jest.spyOn(mockService, 'getRawMany');

    // Llamamos nuestro servicio y le paso el codUser
    await notificationService.findTokensByUser(1);
    expect(spyCreateQueryBuilder).toBeCalledWith('NOTIFICATION');
    expect(spySelect).toBeCalledWith('DISTINCT   (NOTIFICATION.tokenPush)', 'tokenPush');
    expect(spyInnerJoin).toBeCalledWith(User, 'USER', ' USER.id = NOTIFICATION.codUser');
    expect(spyWhere).toBeCalledWith('USER.id = :id', {
      id: 1,
    });
    expect(spyGetRawMany).toBeCalled();
  });

  it('Validate findTokensByTask  ', async () => {
    const spyCreateQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyGetRawMany = jest.spyOn(mockService, 'getRawMany');
    // Llamamos nuestro servicio y le paso el codUser
    await notificationService.findTokensByTask(1);
    expect(spyCreateQueryBuilder).toBeCalledWith('NOTIFICATION');
    expect(spySelect).toBeCalledWith('DISTINCT   (NOTIFICATION.tokenPush)', 'tokenPush');
    expect(spyInnerJoin).toHaveBeenNthCalledWith(
      1,
      User,
      'USER',
      ' USER.id = NOTIFICATION.codUser',
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

  it('Validate registerTaskTokenByUser Ok', async () => {
    const spyFindTokensByUser = jest
      .spyOn(notificationService, 'findTokensByUser')
      .mockResolvedValue(TaskServiceMock.tokenByUser);
    const spySendNotification = jest
      .spyOn(notificationService, 'sendNotification')
      .mockImplementation(async () => {
        return;
      });
    const registerTaskTokenByUser = await notificationService.registerTaskTokenByUser(
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
    expect(registerTaskTokenByUser.message).toEqual(Constants.MSG_OK);
  });

  it('Validate registerTaskTokenByUser Error', async () => {
    const spyFindTokensByUser = jest
      .spyOn(notificationService, 'findTokensByUser')
      .mockImplementation(async () => {
        throw new Error('');
      });
    const spySendNotification = jest.spyOn(notificationService, 'sendNotification');
    await expect(
      notificationService.registerTaskTokenByUser(UserServiceMock.mockFindAllUserData),
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
    const noBlockErrorSendNotications = await notificationService.registerTaskTokenByUser(
      UserServiceMock.mockFindAllUserData,
    );
    expect(noBlockErrorSendNotications.message).toEqual(Constants.MSG_OK);
  });

  it('Validate findTokensBySchedule', async () => {
    const spyCreateQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyGetRawMany = jest.spyOn(mockService, 'getRawMany');
    await notificationService.findTokensBySchedule(NotificationMockService.codSchedule);
    expect(spyCreateQueryBuilder).toBeCalledWith('NOTIFICATION');
    expect(spySelect).toBeCalledWith('DISTINCT   (NOTIFICATION.tokenPush)', 'tokenPush');
    expect(spyInnerJoin).toHaveBeenNthCalledWith(
      1,
      User,
      'USER',
      ' USER.id = NOTIFICATION.codUser',
    );
    expect(spyInnerJoin).toHaveBeenNthCalledWith(
      2,
      Schedule,
      'SCHEDULE',
      ' SCHEDULE.id = USER.codSchedule',
    );
    expect(spyWhere).toHaveBeenCalledWith('SCHEDULE.id = :codSchedule', {
      codSchedule: NotificationMockService.codSchedule,
    });
    expect(spyGetRawMany).toBeCalled();
  });
});
