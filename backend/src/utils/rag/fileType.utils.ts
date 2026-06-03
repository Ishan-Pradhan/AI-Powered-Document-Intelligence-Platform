export const resolveFileType = (file: Express.Multer.File): string => {
  if (file.mimetype === 'application/pdf') return 'pdf';

  if (
    file.originalname.endsWith('.docx') ||
    file.mimetype.includes('wordprocessingml')
  ) {
    return 'docx';
  }

  if (
    file.originalname.endsWith('.csv') ||
    file.originalname.endsWith('.xlsx') ||
    file.originalname.endsWith('.xls')
  ) {
    return 'txt';
  }

  return 'txt';
};
