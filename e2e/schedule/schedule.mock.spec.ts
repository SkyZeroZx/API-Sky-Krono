import { CreateScheduleDto } from '../../src/schedule/dto/create-schedule.dto';
import { UpdateScheduleDto } from '../../src/schedule/dto/update-schedule.dto';
import { Schedule } from '../../src/schedule/entities/schedule.entity';
import { e2e_config } from '../e2e-config.spec';
const {
  schedules: {
    scheduleUpdate: { id },
  },
} = e2e_config.env;
export class ScheduleE2EMock {
  generateRandomString(length: number): string {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  readonly createScheduleDto: CreateScheduleDto = {
    name: this.generateRandomString(12),
    description: 'MOCK E2E API',
    entryHour: '12:12',
    exitHour: '15:15',
    toleranceTime: 5,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  };

  static readonly scheduleNotificationEnabled: Schedule = {
    id: 1,
    name: 'MOCK NAME',
    notificationIsActive: true,
    description: 'MOCK',
    entryHour: '10:10',
    exitHour: '12:12',
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
    toleranceTime: 12,
  };

  static readonly scheduleNotificationDisabled: Schedule = {
    id: 1,
    name: 'MOCK NAME',
    notificationIsActive: false,
    description: 'MOCK',
    entryHour: '10:10',
    exitHour: '12:12',
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
    toleranceTime: 12,
  };

  readonly updateScheduleDto: UpdateScheduleDto = {
    codSchedule: id,
    notificationIsActive: false,
    name: this.generateRandomString(12),
    description: 'MOCK E2E API',
    entryHour: '12:12',
    exitHour: '15:15',
    toleranceTime: 5,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  };

  readonly updateScheduleDtoNotificationActive: UpdateScheduleDto = {
    codSchedule: id,
    notificationIsActive: true,
    name: this.generateRandomString(12),
    description: 'MOCK E2E API',
    entryHour: '12:12',
    exitHour: '15:15',
    toleranceTime: 5,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  };

  static readonly tokensBySchedule = [
    {
      tokenPush:
        '{"endpoint":"https://fcm.googleapis.com/fcm/send/do4QO0D4wTo:APA91bFli8lwF7QRhlpecZYsByA0Tv1vgbSVh824Qilp3uqprZ8-xWyMhaDIY8ZmRYNg6XIsZtmyhjtTBg-XY2Y0L1s7UOHkzvlznRmlYNOLPv7VIBMr4olcXTvq7fsLxqtxrt9sZb7H","expirationTime":null,"keys":{"p256dh":"BJgTpThWU3ZI0-jkNwHi94fbezBMoh5nEjE2VB22m2DQYXJKKW7o8_y8wllUPtCfkbRV8BLD1_yLUiPyCPnhRdc","auth":"e7LYbGepJ0-l3EGy8rgj8Q"}}',
    },
  ];
}
