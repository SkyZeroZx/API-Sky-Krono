export class LicenceResponse {
  public static readonly listLicence = {
    status: 200,
    description: 'Devolucion exitosa',
    schema: {
      type: 'array',
      example: [
        {
          id: 1,
          codUser: 25,
          description: 'Description 1',
          dateInit: '2022-10-08',
          dateEnd: '2022-10-01',
          fullName: 'Juan Perez Ruiz',
        },
        {
          id: 2,
          codUser: 35,
          description: 'Description 1',
          dateInit: '2022-10-08',
          dateEnd: '2022-10-01',
          fullName: 'Jose Quijada Torres',
        },
      ],
    },
  };
}
