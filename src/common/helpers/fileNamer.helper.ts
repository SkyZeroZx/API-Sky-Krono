export const fileNamer = (username: string, file: Express.Multer.File) => {
  const fileExtension = file.mimetype.split('/')[1];

  return `${username}.${fileExtension}`;
};
