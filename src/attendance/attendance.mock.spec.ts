import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { ReportAttendanceDto } from './dto/report-attendance.dto';
import { ReportChartAttendance } from './dto/report-chart-attendance';
import { Attendance } from './entities/attendance.entity';

export class AttendanceServiceMock {
  public save = jest.fn().mockReturnThis();
  public query = jest.fn().mockReturnThis();

  public addSelect = jest.fn().mockReturnThis();

  public delete = jest.fn().mockReturnThis();

  public getRawMany = jest.fn().mockReturnThis();

  public findTokensByTask = jest.fn().mockReturnThis();

  public findTokensByUser = jest.fn().mockReturnThis();

  public create = jest.fn().mockReturnThis();

  public innerJoin = jest.fn().mockReturnThis();

  public saveTaskToUser = jest.fn().mockReturnThis();

  public where = jest.fn().mockReturnThis();

  public select = jest.fn().mockReturnThis();

  public update = jest.fn().mockReturnThis();

  public set = jest.fn().mockReturnThis();

  public execute = jest.fn().mockReturnThis();

  public find = jest.fn().mockReturnThis();

  public from = jest.fn().mockReturnThis();

  public addUserToTask = jest.fn().mockReturnThis();

  public removeUserToTask = jest.fn().mockReturnThis();

  public findByUser = jest.fn().mockReturnThis();

  public findOneOrFail = jest.fn().mockReturnThis();

  public getRawOne = jest.fn().mockReturnThis();
  public findOneBy = jest.fn().mockReturnThis();
  public findScheduleByUser = jest.fn().mockReturnThis();
  public limit = jest.fn().mockReturnThis();
  public orderBy = jest.fn().mockReturnThis();
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
    orderBy: this.orderBy,
    limit: this.limit,
  }));

  public findOne = jest.fn().mockReturnThis();

  public historyAttendance = jest.fn().mockReturnThis();

  public reportAttendanceByUser  = jest.fn().mockReturnThis();

  public reportChartsAttendance = jest.fn().mockReturnThis();

  public reportChartsAttendanceByUser = jest.fn().mockReturnThis();

  public static readonly createAttendanceDto: CreateAttendanceDto = {
    description: 'Mock Create Description',
  };

  public static readonly attendance: Attendance = {
    id: 1,
    codUser: 1,
    description: 'MOCK CREATE DESCRIPTION',
    isActive: false,
    isLater: false,
    isAbsent: false,
    date: new Date(),
    entryTime: new Date(),
    exitTime: new Date(),
    isDayOff: false,
    isLicence: false,
  };

  public static readonly listHistoryStatusAttendance: any[] = [
    {
      date: new Date(),
      isActive: false,
      isLater: false,
      isAbsent: false,
      isDayOff: false,
    },
    {
      date: new Date(),
      isActive: false,
      isLater: false,
      isAbsent: false,
      isDayOff: false,
    },
  ];

  public static readonly reportAttendanceDto: ReportAttendanceDto = {
    id: 1,
    dateRange: ['2022-10-12', '2022-10-25'],
  };

  public static readonly reportChartAttendance : ReportChartAttendance = {
    id: 1,
    dateRange: ['2022-10-12', '2022-10-25'],
  }
}
