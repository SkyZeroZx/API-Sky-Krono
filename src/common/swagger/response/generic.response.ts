export class GenericResponse {
  public static readonly response = {
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
