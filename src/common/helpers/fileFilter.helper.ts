export const fileFilter = (_req: Express.Request, file: Express.Multer.File, callback: Function) => {
  if (!file) return callback(new Error('File is empty'), false);

  const fileExptension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'bmp'];

  if (validExtensions.includes(fileExptension)) {
    return callback(null, true);
  }

  callback(null, false);
};
