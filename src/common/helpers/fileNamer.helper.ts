export const fileNamer = (file: Express.Multer.File, username: string) => {
  const fileExtension = file.mimetype.split('/')[1];

  return `${username}.${fileExtension}`;
};
