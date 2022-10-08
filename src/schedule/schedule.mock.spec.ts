import { CronJob, CronTime } from 'cron';
import { DateTime } from 'luxon';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';

export class ScheduleServiceMock {
  public save = jest.fn().mockReturnThis();

  public addSelect = jest.fn().mockReturnThis();

  public delete = jest.fn().mockReturnThis();

  public getRawMany = jest.fn().mockReturnThis();

  public findTokensByTask = jest.fn().mockReturnThis();

  public findTokensByUser = jest.fn().mockReturnThis();

  public innerJoin = jest.fn().mockReturnThis();

  public saveTaskToUser = jest.fn().mockReturnThis();

  public where = jest.fn().mockReturnThis();

  public select = jest.fn().mockReturnThis();

  public create = jest.fn().mockReturnThis();

  public update = jest.fn().mockReturnThis();

  public set = jest.fn().mockReturnThis();

  public execute = jest.fn().mockReturnThis();

  public find = jest.fn().mockReturnThis();

  public from = jest.fn().mockReturnThis();

  public addUserToTask = jest.fn().mockReturnThis();

  public removeUserToTask = jest.fn().mockReturnThis();

  public findByUser = jest.fn().mockReturnThis();

  public getRawOne = jest.fn().mockReturnThis();

  public createQueryBuilder = jest.fn(() => ({
    where: this.where,
    select: this.select,
    addSelect: this.addSelect,
    getRawMany: this.getRawMany,
    innerJoin: this.innerJoin,
    update: this.update,
    set: this.set,
    execute: this.execute,
    getRawOne: this.getRawOne,
  }));

  public setTime = jest.fn().mockReturnThis();

  public deleteCronJob = jest.fn().mockReturnThis();

  public addCronJob = jest.fn().mockReturnThis();
  public start = jest.fn().mockReturnThis();

  public getCronJob = jest.fn(() => ({
    setTime: this.setTime,
    start: this.start,
  }));

  public static readonly cronTimeString: string = '* * * * *';

  public static readonly cronJob: CronJob = {
    running: false,
    fireOnTick: undefined,
    start: function (): void {
      return;
    },
    stop: function (): void {
      return;
    },
    setTime: function (time: CronTime): void {
      return;
    },
    lastDate: function (): Date {
      return;
    },
    nextDate: function (): DateTime {
      return;
    },
    nextDates: function (): DateTime {
      return;
    },
    addCallback: function (callback: Function): void {
      return;
    },
  };

  static readonly updateScheduleDto: UpdateScheduleDto = {
    codSchedule: 1,
    notificationIsActive: true,
    name: 'create mock',
    description: 'description mock',
    entryHour: '12:12',
    exitHour: '23:23',
    toleranceTime: 15,
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: true,
    saturday: false,
    sunday: false,
  };

  static readonly disabledNotifications: UpdateScheduleDto = {
    codSchedule: 1,
    notificationIsActive: false,
    name: 'create disabled',
    description: 'description mock',
    entryHour: '12:12',
    exitHour: '23:23',
    toleranceTime: 15,
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: true,
    saturday: false,
    sunday: false,
  };

  static readonly createScheduleDto: CreateScheduleDto = {
    name: 'create mock',
    description: 'description mock',
    entryHour: '12:12',
    exitHour: '23:23',
    toleranceTime: 15,
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: true,
    saturday: false,
    sunday: false,
  };

  static readonly schedule: Schedule = {
    id: 1,
    name: 'create mock',
    description: 'description mock',
    entryHour: '12:12',
    exitHour: '23:23',
    toleranceTime: 15,
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: true,
    saturday: false,
    sunday: false,
    notificationIsActive: false,
  };

  static readonly listSchedule: Schedule[] = [
    {
      id: 1,
      name: 'create mock',
      description: 'description mock',
      entryHour: '12:12',
      exitHour: '23:23',
      toleranceTime: 15,
      monday: true,
      tuesday: true,
      wednesday: false,
      thursday: false,
      friday: true,
      saturday: false,
      sunday: false,
      notificationIsActive: false,
    },
    {
      id: 2,
      name: 'create mock 2',
      description: 'description mock',
      entryHour: '13:12',
      exitHour: '15:23',
      toleranceTime: 25,
      monday: true,
      tuesday: true,
      wednesday: false,
      thursday: false,
      friday: true,
      saturday: false,
      sunday: false,
      notificationIsActive: false,
    },
  ];
  public sendNotification = jest.fn().mockReturnThis();

  public findTokensBySchedule = jest.fn().mockReturnThis();

  public static readonly listTokens: any[] = [
    { tokenPush: 'Token1' },
    { tokenPush: 'Token2' },
    { tokenPush: 'Token3' },
  ];

  public findAll = jest.fn().mockReturnThis();

  public remove = jest.fn().mockReturnThis();

  public findScheduleByUser = jest.fn().mockReturnThis();
}
