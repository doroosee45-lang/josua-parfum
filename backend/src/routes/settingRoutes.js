import { Router } from 'express';
import {
  exportFullBackup,
  getSettings,
  updateSettings,
} from '../controllers/settingController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getSettings);
router.put('/', requireAdminAuth, updateSettings);
router.get('/backup', requireAdminAuth, exportFullBackup);

export default router;
