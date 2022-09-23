import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Constant } from '../common/constants/Constant';
import { NotificacionService } from '../notificacion/notificacion.service';
import { TaskToUserDto } from '../task_to_user/dto/task-to-user.dto';
import { TaskToUser } from '../task_to_user/entities/task_to_user.entity';
import { TaskToUserService } from '../task_to_user/task_to_user.service';
import { Type } from '../type/entities/type.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { DeleteTaskDto } from './dto/delete-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly notificacionService: NotificacionService,
    private readonly serviceTaskToUser: TaskToUserService,
  ) {}

  /**
   * It creates a task and assigns it to a list of users
   * @param {CreateTaskDto} createTaskDto - CreateTaskDto
   * @returns an object with the following structure:
   * ```
   * {
   *   message: string;
   *   info?: string;
   *   task?: Task;
   * }
   * ```
   */
  async create(createTaskDto: CreateTaskDto) {
    let task: Task;
    this.logger.log('Creando Task');
    try {
      const newTask = this.taskRepository.create({
        title: createTaskDto.title,
        description: createTaskDto.description,
        start: createTaskDto.dateRange[0],
        end: createTaskDto.dateRange[1],
        codType: createTaskDto.codType,
      });
      task = await this.taskRepository.save(newTask);
    } catch (error) {
      this.logger.error({ message: `Sucedio un error al crear el task`, createTaskDto, error });
      throw new InternalServerErrorException('Sucedio un error al crear el task');
    }

    let tasksPerUser: any[] = [];

    try {
      createTaskDto.users.forEach((user) => {
        tasksPerUser.push(this.serviceTaskToUser.saveTaskToUser(task.codTask, user.id));
      });
      await Promise.all(tasksPerUser);
    } catch (error) {
      this.logger.error({
        message: `Sucedio un error al registrar el usuario a la tarea ${task.codTask}`,
        error,
      });
      throw new InternalServerErrorException('Sucedio un error al asignar la tarea al usuario');
    }

    this.logger.log('Task registrado exitosamente');
    return {
      message: Constant.MENSAJE_OK,
      info: 'Task registrado exitosamente',
    };
  }

  /**
   * It returns a list of tasks with the following fields: id, title, description, start, end, startDate,
   * endDate, backgroundColor, borderColor, display and codType
   * @returns An array of objects with the following structure:
   * ```
   * [
   *   {
   *     id: 1,
   *     title: 'Task 1',
   *     description: 'Description 1',
   *     start: '2020-01-01T08:00:00',
   *     end: '2020-01-01T09:00:00',
   *     startDate: '2020
   */
  async findAll() {
    return this.taskRepository
      .createQueryBuilder('TASK')
      .select('TASK.codTask', 'id')
      .addSelect('TASK.title', 'title')
      .addSelect('TASK.description', 'description')
      .addSelect('CONCAT (DATE_FORMAT(TASK.start,"%Y-%m-%d"),"T",TYPE.start )', 'start')
      .addSelect('CONCAT (DATE_FORMAT(TASK.end,"%Y-%m-%d"),"T" ,TYPE.end  )', 'end')
      .addSelect('DATE_FORMAT(TASK.start,"%Y-%m-%d")', 'startDate')
      .addSelect('DATE_FORMAT(TASK.end,"%Y-%m-%d")', 'endDate')
      .addSelect('TYPE.backgroundColor', 'backgroundColor')
      .addSelect('TYPE.borderColor', 'borderColor')
      .addSelect('TYPE.display', 'display')
      .addSelect('TYPE.codType', 'codType')
      .innerJoin(Type, 'TYPE', 'TYPE.codType = TASK.codType')
      .getRawMany();
  }

  /**
   * It returns a list of tasks with the following fields: id, title, description, start, end,
   * backgroundColor, borderColor, display
   * @param id - The id of the user
   * @returns An array of objects with the following structure:
   * ```
   * [
   *   {
   *     id: 1,
   *     title: 'Task 1',
   *     description: 'Description 1',
   *     start: '2020-01-01T08:00:00',
   *     end: '2020-01-01T09:00:00',
   *     backgroundColor: '#
   */
  async findByUser(id) {
    return this.taskRepository
      .createQueryBuilder('TASK')
      .select('TASK.codTask', 'id')
      .addSelect('TASK.title', 'title')
      .addSelect('TASK.description', 'description')
      .addSelect('TYPE.codType', 'codType')
      .addSelect('CONCAT (DATE_FORMAT(TASK.start,"%Y-%m-%d"),"T",TYPE.start )', 'start')
      .addSelect('CONCAT (DATE_FORMAT(TASK.end,"%Y-%m-%d"),"T" ,TYPE.end  )', 'end')
      .addSelect('TYPE.backgroundColor', 'backgroundColor')
      .addSelect('TYPE.borderColor', 'borderColor')
      .addSelect('TYPE.display', 'display')
      .innerJoin(Type, 'TYPE', 'TYPE.codType = TASK.codType')
      .innerJoin(TaskToUser, 'TASK_TO_USER', 'TASK_TO_USER.codTask = TASK.codTask')
      .innerJoin(User, 'USER', 'USER.id =TASK_TO_USER.codUser')
      .where('USER.id = :id', {
        id: id,
      })
      .getRawMany();
  }

  /**
   * It returns a list of users that are assigned to a task
   * @param {number} codTask - number
   * @returns An array of objects with the following structure:
   * [
   *   {
   *     id: 1,
   *     name: 'Juan',
   *     fatherLastName: 'Perez',
   *     motherLastName: 'Gonzalez',
   *   },
   *   {
   *     id: 2,
   *     name: 'Pedro',
   */
  async findByTask(codTask: number) {
    return this.taskRepository
      .createQueryBuilder('TASK')
      .select('USER.id', 'id')
      .addSelect('USER.name', 'name')
      .addSelect('USER.fatherLastName', 'fatherLastName')
      .addSelect('USER.motherLastName', 'motherLastName')
      .innerJoin(TaskToUser, 'TASK_TO_USER', 'TASK_TO_USER.codTask = TASK.codTask')
      .innerJoin(User, 'USER', 'USER.id =TASK_TO_USER.codUser')
      .where('TASK.codTask = :codTask', {
        codTask: codTask,
      })
      .getRawMany();
  }

  /**
   * It updates a task.
   * @param {UpdateTaskDto} updateTaskDto - UpdateTaskDto
   * @returns return {
   *     message: Constant.MENSAJE_OK,
   *     info: 'Task Actualizado Correctamente',
   *   };
   */
  async update(updateTaskDto: UpdateTaskDto) {
    this.logger.log({ message: 'Actualizando tarea', updateTaskDto });
    try {
      const updateTask = await this.taskRepository
        .createQueryBuilder()
        .update(Task)
        .set({
          codType: updateTaskDto.codType,
          title: updateTaskDto.title,
          description: updateTaskDto.description,
          start: updateTaskDto.dateRange[0],
          end: updateTaskDto.dateRange[1],
        })
        .where('codTask = :codTask', { codTask: updateTaskDto.codTask })
        .execute();
      if (updateTask.affected > 0) {
        this.logger.log({ message: `Se actualizo exitosamente el task`, updateTaskDto });
        const tokens = await this.notificacionService.findTokensByTask(updateTaskDto.codTask);
        tokens.forEach((item) => {
          this.notificacionService.sendNotification(
            item.tokenPush,
            Constant.NOTIFICACION_UPDATE_TASK,
          );
        });
        return {
          message: Constant.MENSAJE_OK,
          info: 'Task Actualizado Correctamente',
        };
      }
      this.logger.warn(`No se actualizo ningun registro para el task ${updateTaskDto.codTask}`);
      return { message: 'No se actualizo ningun registro' };
    } catch (error) {
      this.logger.error(`Sucedio un error al actualizar al task ${updateTaskDto.codTask}`, error);
      throw new InternalServerErrorException('Sucedio un error al actualizar al task');
    }
  }

  /**
   * It deletes a task from the database
   * @param {DeleteTaskDto} deleteTaskDto - DeleteTaskDto
   * @returns {
   *     message: string
   *   }
   */
  async removeTask(deleteTaskDto: DeleteTaskDto) {
    this.logger.log({ message: `Eliminando tarea`, deleteTaskDto });
    const tokens = await this.notificacionService.findTokensByTask(deleteTaskDto.codTask);
    try {
      const { affected } = await this.taskRepository.delete({ codTask: deleteTaskDto.codTask });
      if (affected > 0) {
        this.logger.log(`Tarea eliminada exitosamente`);
        tokens.forEach((item) => {
          this.notificacionService.sendNotification(
            item.tokenPush,
            Constant.NOTIFICACION_DELETE_TASK,
          );
        });
        return { message: Constant.MENSAJE_OK, info: 'Tarea eliminada exitosamente' };
      }
      this.logger.warn(`No se encontro tarea a eliminar`);
      throw new InternalServerErrorException('Sucedio un error al eliminar la tarea');
    } catch (error) {
      this.logger.error(`Error al elimanar la tarea`, deleteTaskDto, error);
      throw new InternalServerErrorException('Sucedio un error al eliminar la tarea');
    }
  }

  async removeUserToTask(taskToUserDto: TaskToUserDto) {
    const tokens = await this.notificacionService.findTokensByUser(taskToUserDto.codUser);
    this.logger.log(`El ID user eliminado es  ${taskToUserDto.codUser}`);
    this.logger.log({
      message: 'Obtenemos todos los tokens del usuario antes de eliminarlo ',
      tokens,
    });

    tokens.forEach((item) => {
      this.notificacionService.sendNotification(item.tokenPush, Constant.NOTIFICACION_DELETE_TASK);
    });

    return this.serviceTaskToUser.removeUserToTask(taskToUserDto);
  }

  async addUserToTask(taskToUserDto: TaskToUserDto) {
    const newUserToTask = await this.serviceTaskToUser.addUserToTask(taskToUserDto);
    if (newUserToTask.message == Constant.MENSAJE_OK) {
      const tokens = await this.notificacionService.findTokensByUser(taskToUserDto.codUser);
      tokens.forEach((item) => {
        this.notificacionService.sendNotification(item.tokenPush, Constant.NOTIFICACION_NEW_TASK);
      });
    }

    return newUserToTask;
  }
}
