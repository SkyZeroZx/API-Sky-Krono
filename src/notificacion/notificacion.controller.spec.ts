import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserServiceMock } from '../user/user.mock.spec';
import { Notificacion } from './entities/notificacion.entity';
import { NotificacionController } from './notificacion.controller';
import { NotificacionService } from './notificacion.service';
import { NotificationMockService } from './notification.mock.spec';

describe('NotificacionController', () => {
  let controller: NotificacionController;
  let service: NotificacionService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacionController],
      providers: [
        NotificacionService,
        {
          provide: getRepositoryToken(Notificacion),
          useValue: Repository,
        },
      ],
    }).compile();

    controller = module.get<NotificacionController>(NotificacionController);
    service = module.get<NotificacionService>(NotificacionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Validamos registerSuscriptionNotification', async () => {
    const spySuscribeNotification = jest
      .spyOn(service, 'suscribeNotification')
      .mockResolvedValue(null);
    await controller.registerSuscriptionNotification(
      UserServiceMock.mockResultCreateUser,
      NotificationMockService.createNotificacionDto,
    );
    expect(spySuscribeNotification).toBeCalledWith(
      UserServiceMock.mockResultCreateUser.id,
      NotificationMockService.createNotificacionDto,
    );
  });

  it('Validamos registerTaskTokenByUser', async () => {
    const spySuscribeNotification = jest
      .spyOn(service, 'registerTaskTokenByUser')
      .mockResolvedValue(null);
    await controller.registerTaskTokenByUser(NotificationMockService.sendNotificacionDto);
    expect(spySuscribeNotification).toBeCalledWith(
      NotificationMockService.sendNotificacionDto.users,
    );
  });
});
