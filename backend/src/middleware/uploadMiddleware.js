import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
    const safeExt = ALLOWED_EXTS.has(ext) ? ext : '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `parfum-${uniqueSuffix}${safeExt}`);
  },
});

function fileFilter(_req, file, cb) {
  const mime = (file.mimetype || '').toLowerCase();
  const ext = (path.extname(file.originalname) || '').toLowerCase();

  if (ALLOWED_MIMES.has(mime) || ALLOWED_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Format non pris en charge ("${file.originalname}"). Veuillez sélectionner une image JPG, PNG, WEBP ou HEIC depuis votre téléphone.`
      ),
      false
    );
  }
}

export const uploadPhotosMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 12 * 1024 * 1024, // 12 Mo max par photo
    files: 8,
  },
});
