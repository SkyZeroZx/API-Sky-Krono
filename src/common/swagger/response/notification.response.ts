export class NotificationResponse {
  public static readonly bodySaveToken = {
    status: 201,
    description: 'Registro de Token Exitoso',
    schema: {
      properties: {
        token: { type: 'string', description: 'Token JSON enviado desde el front como string' },
      },
    },
  };
  public static readonly genericReponse = {
    status: 201,
    description: 'Repuesta del servicio exitoso',
    schema: {
      properties: {
        message: { type: 'string', description: 'Mensaje de respuesta exitoso OK' },
        info: { type: 'string', description: 'Informacion relacionada' },
      },
    },
  };
}
