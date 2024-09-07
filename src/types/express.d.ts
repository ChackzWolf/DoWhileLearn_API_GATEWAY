import * as multer from 'multer';

declare global {
  namespace Express {
    interface Request {
      file?: multer.File;  // Adjust the type according to your needs
      files?: multer.File[];  // For multiple files
    }
  }
}