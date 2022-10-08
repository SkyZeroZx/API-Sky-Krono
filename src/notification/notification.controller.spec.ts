import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserServiceMock } from '../user/user.mock.spec';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationMockService } from './notification.mock.spec';
import { NotificationController } from './notification.controller';

describe('NotificationController', () => {
  let notificationController: NotificationController;
  let service: NotificationService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: Repository,
        },
      ],
    }).compile();

    notificationController = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(notificationController).toBeDefined();
  });

  it('Validamos registerSuscriptionNotification', async () => {
    const spySuscribeNotification = jest
      .spyOn(service, 'suscribeNotification')
      .mockResolvedValue(null);
    await notificationController.registerSuscriptionNotification(
      UserServiceMock.userMock,
      NotificationMockService.createNotificationDto,
    );
    expect(spySuscribeNotification).toBeCalledWith(
      UserServiceMock.userMock.id,
      NotificationMockService.createNotificationDto,
    );
  });

  it('Validamos registerTaskTokenByUser', async () => {
    const spySuscribeNotification = jest
      .spyOn(service, 'registerTaskTokenByUser')
      .mockResolvedValue(null);
    await notificationController.registerTaskTokenByUser(
      NotificationMockService.sendNotificationDto,
    );
    expect(spySuscribeNotification).toBeCalledWith(
      NotificationMockService.sendNotificationDto.users,
    );
  });
});
