import multer from 'multer';
import { MAX_UPLOAD_SIZE } from '@skill-store/shared';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/gzip' || file.originalname.endsWith('.tar.gz')) {
      cb(null, true);
    } else {
      cb(new Error('Only .tar.gz files are accepted'));
    }
  },
});
