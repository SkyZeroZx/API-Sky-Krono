import dateFnsTz from 'date-fns-tz';
import { Util } from './util';
import { Schedule } from '../../schedule/entities/schedule.entity';
describe('Util', () => {
  const mockSchedule: Schedule = {
    id: 0,
    name: '',
    notificationIsActive: false,
    description: '',
    entryHour: '10:10',
    exitHour: '',
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
    toleranceTime: 0,
  };

  it('Validate isLater is true', () => {
    const spyFormatInTimeZone = jest
      .spyOn(dateFnsTz, 'formatInTimeZone')
      .mockReturnValueOnce('12:12');
    const value = Util.isLater(mockSchedule);
    expect(spyFormatInTimeZone).toBeCalled();
    expect(value).toBeTruthy();
  });

  it('Validate isLater is false', () => {
    const spyFormatInTimeZone = jest
      .spyOn(dateFnsTz, 'formatInTimeZone')
      .mockReturnValueOnce('09:09');
    const value = Util.isLater(mockSchedule);
    expect(spyFormatInTimeZone).toBeCalled();
    expect(value).toBeFalsy();
  });
});
