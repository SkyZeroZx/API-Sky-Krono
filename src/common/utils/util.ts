import { formatInTimeZone } from 'date-fns-tz';
import { Schedule } from '../../schedule/entities/schedule.entity';
import { hoursToMinutes } from 'date-fns';
import { Constants } from '../constants/Constant';

export class Util {
  static formatLocalDate() {
    let date = new Date();
    return formatInTimeZone(date, process.env.TIME_ZONE, 'yyyy-MM-dd HH:mm');
  }

  static formatDateId(): number {
    let date = new Date();
    return parseInt(formatInTimeZone(date, process.env.TIME_ZONE, 'yyyyMMdd'));
  }

  static getDayOfWeek(): number {
    let date = new Date();
    return parseInt(formatInTimeZone(date, process.env.TIME_ZONE, 'i'));
  }

  static validateRegisterDate(schedule: Schedule): boolean {
    //TODO Validate isPermissions
    const dayOfWeek = Util.getDayOfWeek();
    return schedule[Constants.DAYS_OF_WEEK[dayOfWeek - 1]];
  }

  static isLater({ entryHour, toleranceTime }: Schedule): boolean {
    const date = new Date();
    const currentHour = formatInTimeZone(date, process.env.TIME_ZONE, 'HH:mm');
    const currentTime =
      hoursToMinutes(parseInt(currentHour.slice(0, 2))) + parseInt(currentHour.slice(3, 5));
    const entryHourTime =
      hoursToMinutes(parseInt(entryHour.slice(0, 2))) + parseInt(entryHour.slice(3, 5));
    if (currentTime - entryHourTime > toleranceTime) {
      return true;
    }
    return false;
  }

  static formatTimeCronJob(entryHour: string): string {
    const hour = entryHour.slice(0, 2);
    const minute = entryHour.slice(3, 5);
    return `${minute} ${hour}`;
  }

  static formatCronJob(schedule: Schedule): string {
    let cronJobDay: number[] = [];
    for (let i = 0; i < Constants.DAYS_OF_WEEK_CRON_JOB.length; i++) {
      if (schedule[Constants.DAYS_OF_WEEK_CRON_JOB[i]]) {
        cronJobDay.push(i);
      }
    }
    const timeCronJob = Util.formatTimeCronJob(schedule.entryHour);
    const days = cronJobDay.join(',');
    return `${timeCronJob} * * ${days}`;
  }
}
