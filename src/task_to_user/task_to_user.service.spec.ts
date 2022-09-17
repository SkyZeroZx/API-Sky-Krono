import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constant } from '../common/constants/Constant';
import { TaskToUser } from './entities/task_to_user.entity';
import { TaskToUserMock } from './task_to_user.mock.spec';
import { TaskToUserService } from './task_to_user.service';

describe('TaskToUserService', () => {
  let service: TaskToUserService;
  let mockService: TaskToUserMock = new TaskToUserMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskToUserService,
        {
          provide: getRepositoryToken(TaskToUser),
          useValue: mockService,
        },
      ],
    }).compile();
    service = module.get<TaskToUserService>(TaskToUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Validamos addUserToTask OK', async () => {
    const spySave = jest.spyOn(mockService, 'save');
    const data = await service.addUserToTask(TaskToUserMock.taskToUserDto);
    expect(spySave).toHaveBeenCalledWith(TaskToUserMock.taskToUserDto);
    expect(data.message).toEqual(Constant.MENSAJE_OK);
  });

  it('Validamos addUserToTask Error', async () => {
    const spySaveError = jest
      .spyOn(mockService, 'save')
      .mockRejectedValueOnce(new Error('Sucedio un error'));
    await expect(service.addUserToTask(TaskToUserMock.taskToUserDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al agregar al usuario a la tarea seleccionada',
      }),
    );
    expect(spySaveError).toBeCalled();
  });

  it('Validamos saveTaskToUser', async () => {
    const spySave = jest.spyOn(mockService, 'save');
    await service.saveTaskToUser(
      TaskToUserMock.taskToUserDto.codTask,
      TaskToUserMock.taskToUserDto.codUser,
    );
    expect(spySave).toBeCalled();
  });

  it('Validamos removeUserToTask OK', async () => {
    const spyDelete = jest.spyOn(mockService, 'delete');
    const dataDelete = await service.removeUserToTask(TaskToUserMock.taskToUserDto);
    expect(spyDelete).toBeCalledWith(TaskToUserMock.taskToUserDto);
    expect(dataDelete.message).toEqual(Constant.MENSAJE_OK);
  });

  it('Validamos removeUserToTask Error', async () => {
    const spyDeleteError = jest
      .spyOn(mockService, 'delete')
      .mockRejectedValueOnce(new Error('Sucedio un error'));
    await expect(service.removeUserToTask(TaskToUserMock.taskToUserDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al eliminar al usuario de la tarea seleccionada',
      }),
    );
    expect(spyDeleteError).toBeCalled();
  });
});
