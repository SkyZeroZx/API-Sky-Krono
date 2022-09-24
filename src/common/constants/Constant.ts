/**  CAMPOS PARA CONFIGURACION DATABASE DE ARCHIVO .ENV  EN LA RAIZ DEL PROYECTO **/

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



/* CONSTANTES PARA statusS DE USUARIO Y LOGOS EN EL ENVIO DE CORREO Y NOTIFICACIONES */
export class Constant {
  public static readonly MENSAJE_OK = 'OK';

  public static readonly STATUS_USER = {
    CREADO: 'CREADO',
    HABILITADO: 'HABILITADO',
    BLOQUEADO: 'BLOQUEADO',
    RESETEADO: 'RESETEADO',
  };

  public static readonly LOGO_FIIS = 'https://fiis.unac.edu.pe/images/logo-fiis.png';
  public static readonly LOGO_APP = 'https://skyzerozx.000webhostapp.com/images/logo_app.png';
  public static readonly LOGO_ICON = 'https://skyzerozx.000webhostapp.com/images/favicon0.ico';
  public static readonly CALENDAR_WEB = 'https://sky-calendar-app.vercel.app/#/login';

  public static readonly MAIL = {
    CREATE_NEW_USER:
      "<img src='" +
      Constant.LOGO_APP +
      "'></img>" +
      '<p>Estimado usuario se creado el nuevo usuario, en la app SkyKrono : {{username}} ' +
      '\nSu contraseña es: <b>{{randomPassword}}</b>' +
      '\nPara más detalle comunicarse con el area respectiva</p>',
    RESET_PASSWORD:
      "<img src='" +
      Constant.LOGO_APP +
      "'></img>" +
      '</img> <p>Estimado usuario se ha reseteado la contraseña de su usuario {{username}} ' +
      '\nLa nueva contraseña es: <b> {{passwordReset}} </b> \nPara más detalle comunicarse con el area respectiva</p>',
    UPDATE_STATUS_TRAMITE:
      "<img src='" +
      Constant.LOGO_APP +
      "'></img>" +
      '<p>Por medio del presente cumplimos con informar que su tramite con N° {{id_est_doc}} ' +
      'se actualizado con status: <b> {{status}} </b> para más detalles puede verificar su tramite en ' +
      Constant.CALENDAR_WEB +
      '</p>',
    SEND_CERTIFICATE:
      "<img src='" +
      Constant.LOGO_APP +
      "'></img>" +
      '<p>Por medio del presente cumplimos con informar que su tramite con N°{{id_est_doc}}' +
      ' se actualizado con status: <b>FINALIZADO</b></p><br>' +
      '<p>Puede descargar su certificado en el apartado certificado en la busqueda de tramite+ ' +
      Constant.CALENDAR_WEB +
      '</p>',
  };

  public static readonly WA_MSG = {
    UPDATE_STATUS_TRAMITE:
      'Estimado estudiante se le informa por medio del presente que su tramite N°{{id_est_doc}} se actualizo con nuevo status {{status}}' +
      '\nPara más informacion puede realizar la busqueda de su tramite en la plataforma: ' +
      Constant.CALENDAR_WEB,
    SEND_CERTIFICATE:
      'Estimado estudiante se le informa por medio del presente que su tramite N°{{id_est_doc}} se encuentra FINALIZADO' +
      '\nPara más informacion puede realizar la busqueda de su tramite en la plataforma: ' +
      Constant.CALENDAR_WEB,
  };


  public static readonly NOTIFICATION_REMEMBER_ATTEDANCE = {
    notification: {
      title: 'Recuerde marcar asistencia',
      icon: Constant.LOGO_ICON,
      data: {
        url: Constant.CALENDAR_WEB,
      },
      body: 'Hagalo desde Sky Krono',
      vibrate: [1000, 1000, 1000],
      image: Constant.LOGO_APP,
      actions: [
        {
          action: 'Explorar',
          title: 'Visitar',
        },
      ],
    },
  };







  public static readonly NOTIFICACION_NEW_TASK = {
    notification: {
      title: 'Se creo una nueva tarea para usted',
      icon: Constant.LOGO_ICON,
      data: {
        url: Constant.CALENDAR_WEB,
      },
      body: 'Revise sus calendario de tareas',
      vibrate: [1000, 1000, 1000],
      image: Constant.LOGO_APP,
      actions: [
        {
          action: 'Explorar',
          title: 'Visitar',
        },
      ],
    },
  };

  public static readonly NOTIFICACION_UPDATE_TASK = {
    notification: {
      title: 'Se actualizo una tarea asignada a usted',
      icon: Constant.LOGO_ICON,
      data: {
        url: Constant.CALENDAR_WEB,
      },
      body: 'Revise sus calendario de tareas',
      vibrate: [1000, 1000, 1000],
      image: Constant.LOGO_APP,
      actions: [
        {
          action: 'Explorar',
          title: 'Visitar',
        },
      ],
    },
  };

  public static readonly NOTIFICACION_DELETE_TASK = {
    notification: {
      title: 'Se eliminado una tarea asignada a usted',
      icon: Constant.LOGO_ICON,
      data: {
        url: Constant.CALENDAR_WEB,
      },
      body: 'Revise sus calendario de tareas',
      vibrate: [1000, 1000, 1000],
      image: Constant.LOGO_APP,
      actions: [
        {
          action: 'Explorar',
          title: 'Visitar',
        },
      ],
    },
  };



  public static replaceText(keyText: string[], arrayTextReplace: string[], textForReplace: string) {
    let result = textForReplace;
    for (let i = 0; i < arrayTextReplace.length; i++) {
      result = result.replace(keyText[i].trim(), arrayTextReplace[i].trim());
    }
    return result;
  }
}
