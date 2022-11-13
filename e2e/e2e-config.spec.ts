export const e2e_config = {
  env: {
    pathPhoto: 'e2e/fixture/coffee.jpg',
    jwtToken: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoic2t5emVyb2JvdDY0QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImZpcnN0TG9naW4iOmZhbHNlLCJpYXQiOjE2NjgzODA1MjksImV4cCI6MTY2ODQ2NjkyOX0.EzyfqThtcajBO2hDSjfvFArs6SJACrhjhDr9Jyd9YuEeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoic2t5emVyb2JvdDY0QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImZpcnN0TG9naW4iOmZhbHNlLCJpYXQiOjE2NjgzODA1MjksImV4cCI6MTY2ODQ2NjkyOX0.EzyfqThtcajBO2hDSjfvFArs6SJACrhjhDr9Jyd9YuE',
    },
    jwtTokenFail: {
      Authorization: '',
    },
    users: {
      userSuscribe: {
        id: 1,
      },
      userLoginOk: {
        id: 1,
        codChargue: 1,
        codSchedule: 1,
        username: 'skyzerobot64@gmail.com',
        password: 'Admin1',
        name: 'SkyBot',
        fatherLastName: 'paterno',
        motherLastName: 'materno',
        createdAt: '2022-09-05T11:23:27.399Z',
        updateAt: '2022-11-11T21:40:23.000Z',
        role: 'admin',
        photo: 'https://skykronobucket.s3.amazonaws.com/skyzerobot64@gmail.com.jpeg',
        phone: '961008127',
        status: 'HABILITADO',
        firstLogin: false,
      },
      userReset: {
        id: 31,
        codChargue: 1,
        codSchedule: 1,
        username: 'mysqlserver64@gmail.com',
        password: '7RXI3KIgG8',
        name: 'sdfsdf',
        fatherLastName: 'sdfsdf',
        motherLastName: 'sfdsfsdf',
        createdAt: '2022-10-11T02:03:45.298Z',
        updateAt: '2022-11-09T00:56:12.000Z',
        role: 'admin',
        status: 'RESETEADO',
        photo: null,
        firstLogin: true,
        phone: '234444444',
      },
      userCreate: {
        id: 37,
        codChargue: 1,
        codSchedule: 1,
        username: 'jburgost@unac.edu.pe',
        password: 'D0UaH7OXvl',
        name: 'Jaime',
        fatherLastName: 'Burgos',
        motherLastName: 'Tejada',
        createdAt: '2022-11-09T00:49:43.061Z',
        updateAt: '2022-11-09T00:49:43.061Z',
        role: 'admin',
        status: 'CREADO',
        photo: null,
        phone: '961008127',
        firstLogin: true,
      },
      userBloq: {
        id: 2,
        codChargue: 2,
        codSchedule: 2,
        username: 'saivergx@gmail.com',
        password: 'BUmwyf1QqX',
        name: 'Employee',
        fatherLastName: 'fatherLastName',
        motherLastName: 'motherLastName',
        createdAt: '2022-09-05T11:23:46.502Z',
        updateAt: '2022-11-09T00:58:25.000Z',
        status: 'BLOQUEADO',
        role: 'admin',
        firstLogin: true,
      },
      userAdmin: {
        id: 6,
        username: 'skyzerobot64@gmail.com',
        password: 'Admin1',
        name: 'SkyBot',
        fatherLastName: 'Sky',
        motherLastName: 'Sky',
        createdAt: '2022-06-19T22:05:34.710Z',
        updateAt: '2022-08-27T14:20:40.000Z',
        role: 'admin',
        status: 'HABILITADO',
        firstLogin: false,
      },
      userUpdate: {
        id: 8,
        username: 'ETesting@gmail.com',
        name: 'ETesting',
        fatherLastName: 'fatherLastName',
        motherLastName: 'motherLastName',
        role: 'admin',
        status: 'CREADO',
      },
      userEmployee: {
        username: 'view-user-sky@gmail.com',
        password: 'Admin1',
      },
    },
    tasks: {
      updateTask: {
        codTask: 5,
        title: 'Create',
        description: ' Hcyct',
        codType: 1,
        dateRange: ['2022-07-22T07:00:00', '2022-07-22T14:00:00'],
        users: [],
      },
    },
    findTask: {
      id: 32,
    },
    taskByUser: [
      {
        id: 1,
        name: 'SkyBot',
        fatherLastName: 'paterno',
        motherLastName: 'materno',
      },
      {
        id: 2,
        name: 'Employee',
        fatherLastName: 'fatherLastName',
        motherLastName: 'motherLastName',
      },
      {
        id: 3,
        name: 'Demo',
        fatherLastName: 'paterno',
        motherLastName: 'materno',
      },
      {
        id: 6,
        name: 'CTesting',
        fatherLastName: 'fatherLastName',
        motherLastName: 'motherLastName',
      },
    ],
    types: {
      updateType: {
        codType: 5,
        description: 'Mock Description',
        backgroundColor: '#5e72e4',
        borderColor: '#7a8cf8',
        start: '00:00',
        end: '12:12',
        display: 'BLOCK',
      },
    },
    licences: {
      lincenceUpdate: {
        id: 230,
      },
    },
    chargues: {
      chargueUpdate: {
        id: 191,
      },
    },
    schedules: {
      scheduleUpdate: { id: 63 },
      scheduleWithToken: {
        id: 1,
      },
    },
  },
};
