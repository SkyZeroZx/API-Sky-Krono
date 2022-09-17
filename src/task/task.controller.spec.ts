import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constant } from '../common/constants/Constant';
import { NotificacionService } from '../notificacion/notificacion.service';
import { TaskToUserMock } from '../task_to_user/task_to_user.mock.spec';
import { TaskToUserService } from '../task_to_user/task_to_user.service';
import { UserServiceMock } from '../user/user.mock.spec';
import { Task } from './entities/task.entity';
import { TaskController } from './task.controller';
import { TaskServiceMock } from './task.mock.spec';
import { TaskService } from './task.service';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: TaskService;
  let mockService: TaskServiceMock = new TaskServiceMock();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockService,
        },
        {
          provide: NotificacionService,
          useValue: mockService,
        },
        {
          provide: TaskToUserService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Validamos create ', async () => {
    const spyTaskServiceCreate = jest.spyOn(taskService, 'create');
    await controller.create(TaskServiceMock.createTaskDto);
    expect(spyTaskServiceCreate).toBeCalledWith(TaskServiceMock.createTaskDto);
  });

  it('Validamos findAll', async () => {
    const spyFindAll = jest
      .spyOn(taskService, 'findAll')
      .mockResolvedValueOnce(TaskServiceMock.taskFindAll);
    const findAllData = await controller.findAll();
    expect(spyFindAll).toBeCalled();
    expect(findAllData).toEqual(TaskServiceMock.taskFindAll);
    // Validamos para el caso que findAll del servicio nos retorne un array vacio
    spyFindAll.mockResolvedValue([]);
    const findAllVoid = await controller.findAll();
    expect(spyFindAll).toBeCalledTimes(2);
    expect(findAllVoid).toEqual({ message: 'No se encontraron task' });
  });

  it('Validamos getTaskByUser', async () => {
    const spyFindByUser = jest
      .spyOn(taskService, 'findByUser')
      .mockResolvedValueOnce(TaskServiceMock.taskFindAll);
    const getTaskByUserData = await controller.getTaskByUser(UserServiceMock.mockResultCreateUser);
    expect(spyFindByUser).toBeCalledWith(UserServiceMock.mockResultCreateUser.id);
    expect(getTaskByUserData).toEqual(TaskServiceMock.taskFindAll);
    // Validamos para el caso que findByUser del servicio nos retorne un array vacio
    spyFindByUser.mockResolvedValue([]);
    const getTaskByUserVoid = await controller.getTaskByUser(UserServiceMock.mockResultCreateUser);
    expect(spyFindByUser).toHaveBeenNthCalledWith(2, UserServiceMock.mockResultCreateUser.id);
    expect(getTaskByUserVoid).toEqual({ message: 'No se encontraron task' });
  });

  it('Validamos getUsersByTask', async () => {
    const codTask = '15';
    const spyFindByTask = jest
      .spyOn(taskService, 'findByTask')
      .mockResolvedValueOnce(TaskServiceMock.taskFindAll);
    const getUsersByTaskData = await controller.getUsersByTask(codTask);
    expect(spyFindByTask).toBeCalledWith(parseInt(codTask));
    expect(getUsersByTaskData).toEqual(TaskServiceMock.taskFindAll);
    // Validamos para el caso que findByUser del servicio nos retorne un array vacio
    spyFindByTask.mockResolvedValue([]);
    const getUsersByTaskVoid = await controller.getUsersByTask(codTask);
    expect(spyFindByTask).toHaveBeenNthCalledWith(2, parseInt(codTask));
    expect(getUsersByTaskVoid).toEqual({ message: 'No se encontraron users para el task' });
  });

  it('Validamos removeUserToTask', async () => {
    const spyRemoveUserToTask = jest
      .spyOn(taskService, 'removeUserToTask')
      .mockResolvedValueOnce({ message: Constant.MENSAJE_OK, info: 'Todo salio bien' });
    const removeUserToTask = await controller.removeUserToTask(TaskToUserMock.taskToUserDto);
    expect(spyRemoveUserToTask).toBeCalledWith(TaskToUserMock.taskToUserDto);
    expect(removeUserToTask).toEqual({ message: Constant.MENSAJE_OK, info: 'Todo salio bien' });
  });

  it('Validamos addUserToTask', async () => {
    const spyAddUserToTask = jest
      .spyOn(taskService, 'addUserToTask')
      .mockResolvedValueOnce({ message: Constant.MENSAJE_OK, info: 'Todo salio bien' });
    const addUserToTask = await controller.addUserToTask(TaskToUserMock.taskToUserDto);
    expect(spyAddUserToTask).toBeCalledWith(TaskToUserMock.taskToUserDto);
    expect(addUserToTask).toEqual({ message: Constant.MENSAJE_OK, info: 'Todo salio bien' });
  });

  it('Validamos update', async () => {
    const spyUpdate = jest
      .spyOn(taskService, 'update')
      .mockResolvedValueOnce({ message: Constant.MENSAJE_OK, info: 'Todo salio bien' });
    const update = await controller.update(TaskToUserMock.taskToUserDto);
    expect(spyUpdate).toBeCalledWith(TaskToUserMock.taskToUserDto);
    expect(update).toEqual({ message: Constant.MENSAJE_OK, info: 'Todo salio bien' });
  });

  it('Validamos removeTask', async () => {
    const spyRemoveTask = jest
      .spyOn(taskService, 'removeTask')
      .mockResolvedValueOnce({ message: Constant.MENSAJE_OK, info: 'Todo salio bien' });
    const removeTask = await controller.removeTask(TaskServiceMock.deleteTaskDto);
    expect(spyRemoveTask).toBeCalledWith(TaskServiceMock.deleteTaskDto);
    expect(removeTask).toEqual({ message: Constant.MENSAJE_OK, info: 'Todo salio bien' });
  });
});
