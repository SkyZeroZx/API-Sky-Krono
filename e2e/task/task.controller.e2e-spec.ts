import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as superTest from 'supertest';
import { AppModule } from '../../src/app.module';
import { TaskModule } from '../../src/task/task.module';
import * as config from '../config-e2e.json';
import { TaskMockServiceE2E } from './task.mock.e2e.spec';
import { TaskService } from '../../src/task/task.service';
import { Constant } from '../../src/common/constants/Constant';
import { Task } from '../../src/task/entities/task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskToUserService } from '../../src/task_to_user/task_to_user.service';
import { TaskToUser } from '../../src/task_to_user/entities/task_to_user.entity';

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  // Instanciamos request para posteriormente setear las configuraciones de superTest
  let request;
  let taskServiceMock: TaskService;
  let taskToUserServiceMock: TaskToUserService;
  let taskRepositoryMock: any;
  let taskToUserRepositoryMock: any;
  const {
    jwtToken,
    findTask: { id: idTask },
    taskByUser,
    tasks: { updateTask },
    users: { userLoginOk, userReseteado, userCreado, userBloqueado, userSuscrito },
  } = config.env;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TaskModule],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: TaskToUserService, useValue: taskToUserServiceMock },
        { provide: getRepositoryToken(Task), useValue: taskRepositoryMock },
        { provide: getRepositoryToken(TaskToUser), useValue: taskToUserRepositoryMock },
      ],
    })
      .overrideProvider(getRepositoryToken(Task))
      .useValue(taskRepositoryMock)
      .compile();
    app = moduleFixture.createNestApplication();
    // Inicializamos nuestro validator de los DTO/Entities para validar las excepciones
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    ),
      await app.init();
    taskServiceMock = moduleFixture.get<TaskService>(TaskService);
    taskToUserServiceMock = moduleFixture.get<TaskToUserService>(TaskToUserService);
    taskRepositoryMock = moduleFixture.get(getRepositoryToken(Task));
    taskToUserRepositoryMock = moduleFixture.get(getRepositoryToken(TaskToUser));
    // Configuramos nuestro superTest con la ruta base y nuestro token para peticiones
    request = superTest.agent(app.getHttpServer()).set(jwtToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Al finalizar todos nuevos test cerramos las conexiones para evitar memory leaks
  afterAll(async () => {
    await app.close();
  });

  it('/TASK  (GET) OK', async () => {
    const taskFindAll = await request.get('/task').expect(200);
    expect(taskFindAll.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/TASK (GET) ERROR (MOCK)', async () => {
    const spyFindAllTaskService = jest.spyOn(taskServiceMock, 'findAll').mockResolvedValueOnce([]);
    const taskFindAllError = await request.get('/task');
    expect(taskFindAllError.body.message).toEqual('No se encontraron task');
    expect(spyFindAllTaskService).toBeCalled();
  });

  it('/TASK/USER (GET) ERROR (MOCK)', async () => {
    const spyFindByUser = jest.spyOn(taskServiceMock, 'findByUser').mockResolvedValueOnce([]);
    const userFindByUserError = await request.get('/task/user');
    expect(userFindByUserError.body.message).toEqual('No se encontraron task');
    expect(spyFindByUser).toBeCalled();
  });

  it('/TASK/USER (GET) OK', async () => {
    const userFindByUserError = await request.get('/task/user').expect(200);
    expect(userFindByUserError.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/TASK/TASK_USER/:codTask (GET) OK', async () => {
    const getUsersByTask = await request.get(`/task/task_user/${idTask}`).expect(200);
    expect(getUsersByTask.body).toEqual(taskByUser);
  });

  it('/TASK/TASK_USER/:codTask (GET) ERROR (MOCK)', async () => {
    const spyFindByTask = jest.spyOn(taskServiceMock, 'findByTask').mockResolvedValueOnce([]);
    const getUsersByTaskError = await request.get(`/task/task_user/${idTask}`).expect(200);
    expect(spyFindByTask).toBeCalled();
    expect(getUsersByTaskError.body.message).toEqual('No se encontraron users para el task');
  });

  it('/TASK (POST) OK', async () => {
    const taskCreateOk = await request.post('/task').send(TaskMockServiceE2E.createTaskDto);
    expect(taskCreateOk.body.message).toEqual(Constant.MENSAJE_OK);
    expect(taskCreateOk.body.info).toEqual('Task registrado exitosamente');
  });

  it('/TASK (POST) ERROR (MOCK)', async () => {
    // Validamos el caso que Save de TypeORM de Task falle , lo mockeamos para ello
    const spySaveTaskError = jest.spyOn(taskRepositoryMock, 'save').mockRejectedValueOnce(new Error('Algo salio mal '));
    // Hacemos la llamada a nuestro endpoint correspondiente y pasamos la data valida y esperamos un status 500
    const taskCreateErrorSave = await request.post('/task').send(TaskMockServiceE2E.createTaskDto).expect(500);
    // Validamos las respuestas de nuestro response
    expect(taskCreateErrorSave.body.message).toEqual('Sucedio un error al crear el task');
    expect(spySaveTaskError).toBeCalled();

    // Validamos de manera analoga para el caso donde se guarda cada usuario por su tarea
    const spyTaskToUserServiceError = jest
      .spyOn(taskToUserServiceMock, 'saveTaskToUser')
      .mockRejectedValueOnce(new Error('Algo salio mal '));

    const saveTaskToUserError = await request.post('/task').send(TaskMockServiceE2E.createTaskDto).expect(500);
    expect(saveTaskToUserError.body.message).toEqual('Sucedio un error al asignar la tarea al usuario');
    expect(spyTaskToUserServiceError).toBeCalled();
  });

  it('/TASK (DELETE) OK (MOCK)', async () => {
    const {codUser , codTask}  =TaskMockServiceE2E.taskToUserDto
    const spyDeleteTaskToUser = jest.spyOn(taskToUserRepositoryMock, 'delete').mockResolvedValueOnce(null);
    const taskDeleteOk = await request.delete(`/task?codTask=${codTask}&codUser=${codUser}`)
    expect(taskDeleteOk.body.message).toEqual(Constant.MENSAJE_OK)
    expect(spyDeleteTaskToUser).toBeCalled();
  });

  it('/TASK (DELETE) ERROR (MOCK)', async () => {
    const {codUser , codTask}  =TaskMockServiceE2E.taskToUserDto
    const spyDeleteTaskToUser = jest
      .spyOn(taskToUserRepositoryMock, 'delete')
      .mockRejectedValue(new Error('Sucedio un error'));
    const taskDeleteError = await request.delete(`/task?codTask=${codTask}&codUser=${codUser}`).expect(500);
    expect(taskDeleteError.body.message).toEqual('Sucedio un error al eliminar al usuario de la tarea seleccionada');
    expect(spyDeleteTaskToUser).toBeCalled();
  });

  it('/TASK/ADD_USER (POST) OK', async () => {
    const spySaveTaskToUserRepositoryOk = jest.spyOn(taskToUserRepositoryMock, 'save').mockResolvedValueOnce(null);
    const addUsertToTaskOk = await request.post('/task/add_user').send(TaskMockServiceE2E.taskToUserDto).expect(201);
    expect(addUsertToTaskOk.body.message).toEqual(Constant.MENSAJE_OK);
    expect(spySaveTaskToUserRepositoryOk).toBeCalled();
  });

  it('/TASK/ADD_USER (POST) ERROR [MOCK]', async () => {
    const spySaveTaskToUserRepositoryError = jest
      .spyOn(taskToUserRepositoryMock, 'save')
      .mockRejectedValueOnce(new Error('Algo salio mal '));
    const addUsertToTaskError = await request.post('/task/add_user').send(TaskMockServiceE2E.taskToUserDto).expect(500);
    expect(addUsertToTaskError.body.message).toEqual('Sucedio un error al agregar al usuario a la tarea seleccionada');
    expect(spySaveTaskToUserRepositoryError).toBeCalled();
  });

  it('/TASK PATCH OK (MOCK)', async () => {
    const udpateTaskOk = await request.patch('/task').send(updateTask);
    expect(udpateTaskOk.body.message).toEqual(Constant.MENSAJE_OK);
  });

  it('/TASK PATCH ERROR (MOCK)', async () => {
    const updateTaskNotExist = {
      codTask: 99999,
      title: 'TEST NEW',
      description: 'SDFGSDFSD',
      codType: 1,
      dateRange: ['2022-08-13T07:00:00', '2022-08-13T07:00:00'],
      users: [],
    };
    const updateTaskErrorNotUpdate = await request.patch('/task').send(updateTaskNotExist).expect(200);
    expect(updateTaskErrorNotUpdate.body.message).toEqual('No se actualizo ningun registro');
    const spyExecuteError = jest.spyOn(taskRepositoryMock, 'createQueryBuilder').mockImplementationOnce(async () => {
      new Error('Algo salio mal');
    });

    const updateTaskExecuteError = await request.patch('/task').send(updateTaskNotExist).expect(500);
    expect(updateTaskExecuteError.body.message).toEqual('Sucedio un error al actualizar al task');
    expect(spyExecuteError).toBeCalled();
  });

  it('/TASK/REMOVE_TASK (DELETE) OK (MOCK)', async ()=> {
    const spyDeleteTaskRepository = jest.spyOn(taskRepositoryMock,'delete').mockResolvedValueOnce({affected:1})
    const removeTaskOk = await request.delete(`/task/remove_task/${TaskMockServiceE2E.deleteTaskDto.codTask}`)
    
    expect(removeTaskOk.body.message).toEqual(Constant.MENSAJE_OK);
    expect(spyDeleteTaskRepository).toBeCalled()

  })

  it('/TASK/REMOVE_TASK (DELETE) ERROR (MOCK)', async ()=> {
    const {codTask} = TaskMockServiceE2E.deleteTaskDto
    const spyDeleteTaskRepositoryError = jest.spyOn(taskRepositoryMock,'delete').mockResolvedValueOnce({affected:0})
    const removeTaskError= await request.delete(`/task/remove_task/${codTask}`)
    expect(removeTaskError.body.message).toEqual('Sucedio un error');
    expect(spyDeleteTaskRepositoryError).toBeCalled()


    const spyDeleteTaskRepositoryInternalError= jest.spyOn(taskRepositoryMock,'delete').mockRejectedValueOnce(new Error('Algo salio mal '));
    const removeTaskInternalError= await request.delete(`/task/remove_task/${codTask}`).expect(500)
    expect(spyDeleteTaskRepositoryInternalError).toBeCalled()
    expect(removeTaskInternalError.body.message).toEqual('Sucedio un error al eliminar la tarea')

  })
});
