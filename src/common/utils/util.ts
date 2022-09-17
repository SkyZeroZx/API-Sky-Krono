import { formatInTimeZone } from 'date-fns-tz';
import { Schedule } from '../../schedule/entities/schedule.entity';
import { hoursToMinutes } from 'date-fns';

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
    const dayOfWeek = Util.getDayOfWeek();

    let validate: boolean[] = [];
    const days: string[] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    for (let i = 0; i < days.length; i++) {
      if (schedule[days[i]]) {
        validate.push(dayOfWeek == i + 1);
      }
    }

    const dayIsValid = validate.find((res) => res == true);
    if (dayIsValid == undefined) {
      return false;
    }

    return dayIsValid;
  }

  static isLater({ entryHour, toleranceTime }: Schedule): boolean {
    const date = new Date();
    const currentHour = formatInTimeZone(date, process.env.TIME_ZONE, 'HH:mm');
    const currentTime =
      hoursToMinutes(parseInt(currentHour.slice(0, 3))) + parseInt(currentHour.slice(3, 5));
    const entryHourTime =
      hoursToMinutes(parseInt(entryHour.slice(0, 3))) + parseInt(entryHour.slice(3, 5));
    if (currentTime - entryHourTime > toleranceTime) {
      return true;
    }
    return false;
  }

  static formtHistoryAttendance() {}
}
