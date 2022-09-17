export class TypeResponse {
  public static readonly findAll = {
    status: 200,
    description: 'Devolucion exitosa',
    schema: {
      type: 'array',
      example: [
        {
          codType: 1,
          typeDescription: 'MATUTINO',
          backgroundColor: 'rgba(16,183,89, .25)',
          borderColor: '#10b759',
          start: '07:00:00',
          end: '14:00:00',
          display: 'BLOCK',
        },
        {
          codType: 2,
          typeDescription: 'VESPERTINO',
          backgroundColor: 'rgba(253,126,20,.25)',
          borderColor: '#fd7e14',
          start: '14:00:00',
          end: '20:00:00',
          display: 'BLOCK',
        },
      ],
    },
  };
}
