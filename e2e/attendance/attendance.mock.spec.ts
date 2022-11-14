import { CreateAttendanceDto } from '../../src/attendance/dto/create-attendance.dto';
import { ReportAttendanceDto } from '../../src/attendance/dto/report-attendance.dto';
import { ReportChartAttendance } from '../../src/attendance/dto/report-chart-attendance';

export class AttendanceE2EMock {
  static readonly reportChartAttendance: ReportChartAttendance = {
    id: 1,
    dateRange: ['2022-10-24', '2022-10-30'],
  };

  static readonly reportAttendanceDto: ReportAttendanceDto = {
    id: 1,
    dateRange: ['2022-10-24', '2022-10-30'],
  };

  static readonly createAttendanceDto : CreateAttendanceDto = {
      description: 'Mock Attendance API E2E'
  }
}
