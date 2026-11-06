import { Router } from 'express';
import multer from 'multer';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { uploadPhotosMiddleware } from '../middleware/uploadMiddleware.js';
import { handlePhotoUpload } from '../controllers/uploadController.js';

const router = Router();

router.post('/', requireAdminAuth, (req, res, next) => {
  uploadPhotosMiddleware.array('photos', 8)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'Image trop volumineuse. La taille maximale autorisée est de 12 Mo par photo.',
        });
      }
      return res.status(400).json({
        message: `Erreur lors de l’import de la photo (${err.message}).`,
      });
    }
    return res.status(400).json({
      message: err.message || 'Format d’image non pris en charge.',
    });
  });
}, handlePhotoUpload);

export default router;
