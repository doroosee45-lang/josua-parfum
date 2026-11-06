import { Router } from 'express';
import { changeAdminPassword, loginAdmin, verifySession } from '../controllers/authController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', loginAdmin);
router.get('/verify', requireAdminAuth, verifySession);
router.put('/password', requireAdminAuth, changeAdminPassword);

export default router;
