export class AttendanceResponse {
  public static readonly findOne = {
    status: 200,
    description: 'Obtener Asistencia Actual del usuario logeado',
    schema: {
      example: {
        id: 20221008,
        codUser: 25,
        description: 'Optional Description',
        isActive: true,
        isLater: false,
        isAbsent: false,
        date: new Date().toDateString(),
        entryTime: '15:00',
        exitTime: '21:00',
        isDayOff: false,
        isLicence: false,
      },
    },
  };

  public static readonly historyAttendance = {
    status: 200,
    description: 'Devolucion exitosa',
    schema: {
      type: 'array',
      example: [
        {
          date: '2022-10-08',
          isActive: true,
          isLater: false,
          isAbsent: false,
          isDayOff: false,
        },
        {
          date: '2022-10-07',
          isActive: false,
          isLater: false,
          isAbsent: false,
          isDayOff: false,
        },
        {
          date: '2022-10-06',
          isActive: false,
          isLater: false,
          isAbsent: false,
          isDayOff: false,
        },
        {
          date: '2022-10-05',
          isActive: false,
          isLater: false,
          isAbsent: false,
          isDayOff: false,
        },
        {
          date: '2022-10-04',
          isActive: false,
          isLater: false,
          isAbsent: false,
          isDayOff: false,
        },
        {
          date: '2022-10-03',
          isActive: false,
          isLater: false,
          isAbsent: false,
          isDayOff: false,
        },
        {
          date: '2022-10-02',
          isActive: false,
          isLater: false,
          isAbsent: false,
          isDayOff: false,
        },
        {
          date: '2022-10-01',
          isActive: false,
          isLater: false,
          isAbsent: false,
          isDayOff: false,
        },
      ],
    },
  };
}
