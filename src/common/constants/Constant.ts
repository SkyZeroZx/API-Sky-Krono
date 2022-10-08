export const JWT_TOKEN = 'JWT_TOKEN';
export const DATABASE_HOST = 'DATABASE_HOST';
export const DATABASE_PORT = 'DATABASE_PORT';
export const DATABASE_USERNAME = 'DATABASE_USERNAME';
export const DATABASE_PASSWORD = 'DATABASE_PASSWORD';
export const DATABASE_NAME = 'DATABASE_NAME';
export const ENABLED_MYSQL_CACHE = 'ENABLED_MYSQL_CACHE';
export const CACHE_TTL = 'CACHE_TTL';
export const CACHE_MAX_ITEMS = 'CACHE_MAX_ITEMS';
export const CACHE_GLOBAL_NESTJS = 'CACHE_GLOBAL_NESTJS';

export class Constants {
  static readonly MSG_OK = 'OK';
  static readonly STATUS_USER = {
    CREADO: 'CREADO',
    HABILITADO: 'HABILITADO',
    BLOQUEADO: 'BLOQUEADO',
    RESETEADO: 'RESETEADO',
  };

  static readonly DAYS_OF_WEEK: string[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  static readonly DAYS_OF_WEEK_CRON_JOB: string[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  static readonly LOGO_APP = 'https://skyzerozx.000webhostapp.com/images/logo_app.png';
  static readonly LOGO_ICON = 'https://skyzerozx.000webhostapp.com/images/favicon0.ico';
  static readonly URL_WEB = 'https://sky-krono-app.vercel.app/#/login';

  static readonly MAIL = {
    CREATE_NEW_USER:
      "<img src='" +
      Constants.LOGO_APP +
      "'></img>" +
      '<p>Estimado usuario se creado el nuevo usuario, en la app SkyKrono : {{username}} ' +
      '\nSu contraseña es: <b>{{randomPassword}}</b>' +
      '\nPara más detalle comunicarse con el area respectiva</p>',
    RESET_PASSWORD:
      "<img src='" +
      Constants.LOGO_APP +
      "'></img>" +
      '</img> <p>Estimado usuario se ha reseteado la contraseña de su usuario {{username}} ' +
      '\nLa nueva contraseña es: <b> {{passwordReset}} </b> \nPara más detalle comunicarse con el area respectiva</p>',
  };

  static readonly NOTIFICATION_REMEMBER_ATTEDANCE = {
    notification: {
      title: 'Recuerde marcar asistencia',
      icon: Constants.LOGO_ICON,
      data: {
        url: Constants.URL_WEB,
      },
      body: 'Hagalo desde Sky Krono',
      vibrate: [1000, 1000, 1000],
      image: Constants.LOGO_APP,
      actions: [
        {
          action: 'Explorar',
          title: 'Visitar',
        },
      ],
    },
  };

  static readonly NOTIFICATION_NEW_TASK = {
    notification: {
      title: 'Se creo una nueva tarea para usted',
      icon: Constants.LOGO_ICON,
      data: {
        url: Constants.URL_WEB,
      },
      body: 'Revise sus calendario de tareas',
      vibrate: [1000, 1000, 1000],
      image: Constants.LOGO_APP,
      actions: [
        {
          action: 'Explorar',
          title: 'Visitar',
        },
      ],
    },
  };

  static readonly NOTIFICATION_UPDATE_TASK = {
    notification: {
      title: 'Se actualizo una tarea asignada a usted',
      icon: Constants.LOGO_ICON,
      data: {
        url: Constants.URL_WEB,
      },
      body: 'Revise sus calendario de tareas',
      vibrate: [1000, 1000, 1000],
      image: Constants.LOGO_APP,
      actions: [
        {
          action: 'Explorar',
          title: 'Visitar',
        },
      ],
    },
  };

  static readonly NOTIFICATION_DELETE_TASK = {
    notification: {
      title: 'Se eliminado una tarea asignada a usted',
      icon: Constants.LOGO_ICON,
      data: {
        url: Constants.URL_WEB,
      },
      body: 'Revise sus calendario de tareas',
      vibrate: [1000, 1000, 1000],
      image: Constants.LOGO_APP,
      actions: [
        {
          action: 'Explorar',
          title: 'Visitar',
        },
      ],
    },
  };

  static replaceText(keyText: string[], arrayTextReplace: string[], textForReplace: string) {
    let result = textForReplace;
    for (let i = 0; i < arrayTextReplace.length; i++) {
      result = result.replace(keyText[i].trim(), arrayTextReplace[i].trim());
    }
    return result;
  }
}
