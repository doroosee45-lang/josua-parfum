import { Router } from 'express';
import {
  createOrder,
  deleteOrder,
  getAdminOrders,
  getOrderByReference,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public order submission & confirmation lookup
router.post('/', createOrder);
router.get('/ref/:reference', getOrderByReference);

// Protected vendor/admin order management
router.get('/', requireAdminAuth, getAdminOrders);
router.patch('/:id/status', requireAdminAuth, updateOrderStatus);
router.delete('/:id', requireAdminAuth, deleteOrder);

export default router;
