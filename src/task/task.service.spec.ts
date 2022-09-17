import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Constant } from '../common/constants/Constant';
import { NotificacionService } from '../notificacion/notificacion.service';
import { TaskToUser } from '../task_to_user/entities/task_to_user.entity';
import { TaskToUserMock } from '../task_to_user/task_to_user.mock.spec';
import { TaskToUserService } from '../task_to_user/task_to_user.service';
import { Type } from '../type/entities/type.entity';
import { User } from '../user/entities/user.entity';
import { Task } from './entities/task.entity';
import { TaskServiceMock } from './task.mock.spec';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let taskService: TaskService;
  let mockService: TaskServiceMock = new TaskServiceMock();
  let notificacionService: NotificacionService;
  let taskToUserService: TaskToUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    taskService = module.get<TaskService>(TaskService);
    notificacionService = module.get<NotificacionService>(NotificacionService);
    taskToUserService = module.get<TaskToUserService>(TaskToUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(taskService).toBeDefined();
    expect(notificacionService).toBeDefined();
    expect(taskToUserService).toBeDefined();
  });

  it('Validamos create OK', async () => {
    const { codTask } = TaskServiceMock.taskSave;
    const { users, description, title, dateRange, codType } = TaskServiceMock.createTaskDto;
    const spyCreate = jest.spyOn(mockService, 'create').mockImplementationOnce(() => {
      return Task;
    });
    const spySaveTaskToUser = jest.spyOn(mockService, 'saveTaskToUser');
    const spySave = jest.spyOn(mockService, 'save').mockReturnValueOnce(TaskServiceMock.taskSave);
    const data = await taskService.create(TaskServiceMock.createTaskDto);

    expect(spySave).toBeCalledWith(Task);
    expect(spyCreate).toBeCalled();
    expect(spySaveTaskToUser).toHaveBeenNthCalledWith(1, codTask, users[0].id);
    expect(spySaveTaskToUser).toHaveBeenNthCalledWith(2, codTask, users[1].id);
    expect(data.message).toEqual(Constant.MENSAJE_OK);
  });

  it('Validamos create Error', async () => {
    const spySaveError = jest
      .spyOn(mockService, 'save')
      .mockRejectedValueOnce(new Error('Sucedio un error'));
    await expect(taskService.create(TaskServiceMock.createTaskDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al crear el task',
      }),
    );
    expect(spySaveError).toBeCalled();
    spySaveError.mockReset();
    const spySaveTaskToUser = jest
      .spyOn(mockService, 'saveTaskToUser')
      .mockRejectedValueOnce(new Error('Sucedio un error'));
    const spySave = jest.spyOn(mockService, 'save').mockReturnValueOnce(TaskServiceMock.taskSave);
    await expect(taskService.create(TaskServiceMock.createTaskDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al asignar la tarea al usuario',
      }),
    );
    expect(spySaveTaskToUser).toBeCalled();
    expect(spySave).toBeCalled();
  });

  it('Validamos findAll', async () => {
    const spyQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyAddSelect = jest.spyOn(mockService, 'addSelect');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyGetRawMany = jest.spyOn(mockService, 'getRawMany');
    await taskService.findAll();
    expect(spyQueryBuilder).toBeCalledWith('TASK');
    expect(spySelect).toHaveBeenNthCalledWith(1, 'TASK.codTask', 'id');
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'TASK.title', 'title');
    expect(spyAddSelect).toHaveBeenNthCalledWith(2, 'TASK.description', 'description');
    expect(spyAddSelect).toHaveBeenNthCalledWith(
      3,
      'CONCAT (DATE_FORMAT(TASK.start,"%Y-%m-%d"),"T",TYPE.start )',
      'start',
    );
    expect(spyAddSelect).toHaveBeenNthCalledWith(
      4,
      'CONCAT (DATE_FORMAT(TASK.end,"%Y-%m-%d"),"T" ,TYPE.end  )',
      'end',
    );
    expect(spyAddSelect).toHaveBeenNthCalledWith(
      5,
      'DATE_FORMAT(TASK.start,"%Y-%m-%d")',
      'startDate',
    );
    expect(spyAddSelect).toHaveBeenNthCalledWith(6, 'DATE_FORMAT(TASK.end,"%Y-%m-%d")', 'endDate');
    expect(spyAddSelect).toHaveBeenNthCalledWith(7, 'TYPE.backgroundColor', 'backgroundColor');
    expect(spyAddSelect).toHaveBeenNthCalledWith(8, 'TYPE.borderColor', 'borderColor');
    expect(spyAddSelect).toHaveBeenNthCalledWith(9, 'TYPE.display', 'display');
    expect(spyAddSelect).toHaveBeenNthCalledWith(10, 'TYPE.codType', 'codType');
    expect(spyInnerJoin).toBeCalledWith(Type, 'TYPE', 'TYPE.codType = TASK.codType');
    expect(spyGetRawMany).toBeCalled();
  });

  it('Validamos findByUser', async () => {
    const spyQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyAddSelect = jest.spyOn(mockService, 'addSelect');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyGetRawMany = jest.spyOn(mockService, 'getRawMany');
    const spyWhere = jest.spyOn(mockService, 'where');
    await taskService.findByUser(1);
    expect(spyQueryBuilder).toBeCalledWith('TASK');
    expect(spySelect).toHaveBeenNthCalledWith(1, 'TASK.codTask', 'id');
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'TASK.title', 'title');
    expect(spyAddSelect).toHaveBeenNthCalledWith(2, 'TASK.description', 'description');
    expect(spyAddSelect).toHaveBeenNthCalledWith(3, 'TYPE.codType', 'codType');
    expect(spyAddSelect).toHaveBeenNthCalledWith(
      4,
      'CONCAT (DATE_FORMAT(TASK.start,"%Y-%m-%d"),"T",TYPE.start )',
      'start',
    );
    expect(spyAddSelect).toHaveBeenNthCalledWith(
      5,
      'CONCAT (DATE_FORMAT(TASK.end,"%Y-%m-%d"),"T" ,TYPE.end  )',
      'end',
    );
    expect(spyAddSelect).toHaveBeenNthCalledWith(6, 'TYPE.backgroundColor', 'backgroundColor');
    expect(spyAddSelect).toHaveBeenNthCalledWith(7, 'TYPE.borderColor', 'borderColor');
    expect(spyAddSelect).toHaveBeenNthCalledWith(8, 'TYPE.display', 'display');
    expect(spyInnerJoin).toHaveBeenNthCalledWith(1, Type, 'TYPE', 'TYPE.codType = TASK.codType');
    expect(spyInnerJoin).toHaveBeenNthCalledWith(
      2,
      TaskToUser,
      'TASK_TO_USER',
      'TASK_TO_USER.codTask = TASK.codTask',
    );
    expect(spyInnerJoin).toHaveBeenNthCalledWith(3, User, 'USER', 'USER.id =TASK_TO_USER.codUser');
    expect(spyWhere).toBeCalledWith('USER.id = :id', { id: 1 });
    expect(spyGetRawMany).toBeCalled();
  });

  it('Validamos findByTask', async () => {
    const spyQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spySelect = jest.spyOn(mockService, 'select');
    const spyAddSelect = jest.spyOn(mockService, 'addSelect');
    const spyInnerJoin = jest.spyOn(mockService, 'innerJoin');
    const spyGetRawMany = jest.spyOn(mockService, 'getRawMany');
    const spyWhere = jest.spyOn(mockService, 'where');
    await taskService.findByTask(1);
    expect(spyQueryBuilder).toBeCalledWith('TASK');
    expect(spySelect).toHaveBeenNthCalledWith(1, 'USER.id', 'id');
    expect(spyAddSelect).toHaveBeenNthCalledWith(1, 'USER.name', 'name');
    expect(spyAddSelect).toHaveBeenNthCalledWith(2, 'USER.fatherLastName', 'fatherLastName');
    expect(spyAddSelect).toHaveBeenNthCalledWith(3, 'USER.motherLastName', 'motherLastName');
    expect(spyInnerJoin).toHaveBeenNthCalledWith(
      1,
      TaskToUser,
      'TASK_TO_USER',
      'TASK_TO_USER.codTask = TASK.codTask',
    );
    expect(spyInnerJoin).toHaveBeenNthCalledWith(2, User, 'USER', 'USER.id =TASK_TO_USER.codUser');
    expect(spyWhere).toBeCalledWith('TASK.codTask = :codTask', {
      codTask: 1,
    });
    expect(spyGetRawMany).toBeCalled();
  });

  it('Validamos Update OK', async () => {
    const { codType, codTask, title, description, dateRange } = TaskServiceMock.updateTaskDto;
    // Creamos nuestros espias
    const spyQueryBuilder = jest.spyOn(mockService, 'createQueryBuilder');
    const spyUpdate = jest.spyOn(mockService, 'update');
    const spySet = jest.spyOn(mockService, 'set');
    const spyWhere = jest.spyOn(mockService, 'where');
    const spyExecuteQueryBuilder = jest
      .spyOn(mockService, 'execute')
      .mockResolvedValue({ affected: 1 });
    const spyFindTokensByTask = jest
      .spyOn(mockService, 'findTokensByTask')
      .mockResolvedValueOnce([]);
    const spySendNotification = jest.spyOn(mockService, 'sendNotification');
    // Llamamos nuestros servicios
    const resolveNotSendNotifications = await taskService.update(TaskServiceMock.updateTaskDto);
    // Validamos las llamadas de nuestros espias con su argumentos
    expect(spyQueryBuilder).toBeCalled();
    expect(spyUpdate).toBeCalledWith(Task);
    expect(spySet).toBeCalledWith({
      codType,
      title,
      description,
      start: dateRange[0],
      end: dateRange[1],
    });
    expect(spyWhere).toBeCalledWith('codTask = :codTask', { codTask });
    expect(spyFindTokensByTask).toBeCalled();
    expect(resolveNotSendNotifications.message).toEqual(Constant.MENSAJE_OK);
    expect(spyExecuteQueryBuilder).toBeCalled();
    expect(spySendNotification).not.toBeCalled();

    // Validamos para el caso que nuestro servicio nos retorne tokens y enviemos notificaciones
    spyFindTokensByTask.mockResolvedValueOnce(TaskServiceMock.tokens);
    // Llamamos nuestro servicio
    const resolveSendNotifications = await taskService.update(TaskServiceMock.updateTaskDto);
    // Validamos las llamadas a nuestros espias y sus argumentos asi como la cantidad de veces llamados
    expect(spyFindTokensByTask).toBeCalledTimes(2);
    expect(spyQueryBuilder).toBeCalledTimes(2);
    expect(spyWhere).toBeCalledTimes(2);
    expect(spyUpdate).toBeCalledTimes(2);
    expect(spySet).toBeCalledTimes(2);
    expect(spySendNotification).toBeCalledTimes(TaskServiceMock.tokens.length);
    expect(resolveSendNotifications.message).toEqual(Constant.MENSAJE_OK);
  });

  it('Validamos Update Error', async () => {
    const spyExecuteQueryBuilder = jest
      .spyOn(mockService, 'execute')
      .mockResolvedValueOnce({ affected: 0 });
    const spySendNotification = jest.spyOn(mockService, 'sendNotification');
    const spyFindTokensByTask = jest.spyOn(mockService, 'findTokensByTask');
    const error = await taskService.update(TaskServiceMock.updateTaskDto);
    expect(error.message).toEqual('No se actualizo ningun registro');
    expect(spyExecuteQueryBuilder).toBeCalled();
    expect(spySendNotification).not.toBeCalled();
    expect(spyFindTokensByTask).not.toBeCalled();

    //Forzamos a nuestro execute del QueryBuilder a retornar un error para probar el catch
    spyExecuteQueryBuilder.mockRejectedValue(new Error());
    await expect(taskService.update(TaskServiceMock.updateTaskDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al actualizar al task',
      }),
    );
    expect(spyExecuteQueryBuilder).toBeCalledTimes(2);
    expect(spySendNotification).not.toBeCalled();
    expect(spyFindTokensByTask).not.toBeCalled();
  });

  it('Validamos removeTask OK', async () => {
    const spyFindTokensByTask = jest
      .spyOn(notificacionService, 'findTokensByTask')
      .mockResolvedValueOnce([]);
    const spyDelete = jest.spyOn(mockService, 'delete').mockResolvedValueOnce({ affected: 1 });
    const spySendNotification = jest.spyOn(mockService, 'sendNotification');
    const removeTaskNotSendNotification = await taskService.removeTask(
      TaskServiceMock.deleteTaskDto,
    );

    expect(spyFindTokensByTask).toBeCalled();
    expect(spyDelete).toBeCalledWith({ codTask: TaskServiceMock.deleteTaskDto.codTask });
    expect(spySendNotification).not.toBeCalled();
    expect(removeTaskNotSendNotification.message).toEqual(Constant.MENSAJE_OK);

    // Mockeamos y creamos nuestros espias para posteriormente validar en caso de la iteracion que envia tokens
    spyDelete.mockResolvedValueOnce({ affected: 1 });
    spyFindTokensByTask.mockResolvedValue(TaskServiceMock.tokenByUser);
    // Llamamos nuestro servicio
    const removeTaskSendNotification = await taskService.removeTask(TaskServiceMock.deleteTaskDto);
    //Validamos la llamada de cada token en su respectiva posicion
    for (let i: number = 0; i < TaskServiceMock.tokenByUser.length; i++) {
      expect(spySendNotification).toHaveBeenNthCalledWith(
        i + 1,
        TaskServiceMock.tokenByUser[i].tokenPush,
        Constant.NOTIFICACION_DELETE_TASK,
      );
    }
    // Validamos las llamadas de nuestros espias y respuestas
    expect(removeTaskSendNotification.message).toEqual(Constant.MENSAJE_OK);
    expect(spyFindTokensByTask).toBeCalledTimes(2);
  });

  it('Validamos removeTask Error', async () => {
    const spyFindTokensByTask = jest.spyOn(mockService, 'findTokensByTask');
    const spyDelete = jest.spyOn(mockService, 'delete').mockRejectedValueOnce(new Error());
    await expect(taskService.removeTask(TaskServiceMock.deleteTaskDto)).rejects.toThrowError(
      new InternalServerErrorException({
        message: 'Sucedio un error al eliminar la tarea',
      }),
    );
    expect(spyDelete).toBeCalled();
    expect(spyFindTokensByTask).toBeCalled();
    spyDelete.mockResolvedValueOnce({ affected: 0 });
    const data = await taskService.removeTask(TaskServiceMock.deleteTaskDto);
    expect(data.message).toEqual('Sucedio un error');
  });

  it('Validamos removeUserToTask OK', async () => {
    const spyFindTokensByTask = jest
      .spyOn(notificacionService, 'findTokensByUser')
      .mockResolvedValue([]);
    const spySendNotification = jest.spyOn(mockService, 'sendNotification');
    const spyRemoveTaskToUser = jest
      .spyOn(taskToUserService, 'removeUserToTask')
      .mockResolvedValueOnce({ message: Constant.MENSAJE_OK, info: 'OK' });

    const removeUserToTask = await taskService.removeUserToTask(TaskToUserMock.taskToUserDto);

    expect(spyFindTokensByTask).toBeCalledWith(TaskToUserMock.taskToUserDto.codUser);
    expect(spySendNotification).not.toBeCalled();
    expect(removeUserToTask.message).toEqual(Constant.MENSAJE_OK);
    expect(spyRemoveTaskToUser).toBeCalled();

    spyFindTokensByTask.mockResolvedValueOnce(TaskServiceMock.tokenByUser);
    await taskService.removeUserToTask(TaskToUserMock.taskToUserDto);
    for (let i: number = 0; i < TaskServiceMock.tokenByUser.length; i++) {
      expect(spySendNotification).toHaveBeenNthCalledWith(
        i + 1,
        TaskServiceMock.tokenByUser[i].tokenPush,
        Constant.NOTIFICACION_DELETE_TASK,
      );
    }
  });

  it('Validamos addUserToTask OK', async () => {
    const spyAddUserToTask = jest
      .spyOn(taskToUserService, 'addUserToTask')
      .mockResolvedValueOnce({ message: Constant.MENSAJE_OK, info: 'Todo salio bien' });
    const spySendNotification = jest.spyOn(mockService, 'sendNotification');
    const spyFindTokensByUser = jest
      .spyOn(notificacionService, 'findTokensByUser')
      .mockResolvedValue(TaskServiceMock.tokenByUser);
    const removeUserToTask = await taskService.addUserToTask(TaskToUserMock.taskToUserDto);

    expect(removeUserToTask.message).toEqual(Constant.MENSAJE_OK);
    expect(spyFindTokensByUser).toBeCalled();
    expect(spyAddUserToTask).toBeCalledWith(TaskToUserMock.taskToUserDto);
    //Validamos la llamada de cada token en su respectiva posicion
    for (let i: number = 0; i < TaskServiceMock.tokenByUser.length; i++) {
      expect(spySendNotification).toHaveBeenNthCalledWith(
        i + 1,
        TaskServiceMock.tokenByUser[i].tokenPush,
        Constant.NOTIFICACION_NEW_TASK,
      );
    }
  });
});
