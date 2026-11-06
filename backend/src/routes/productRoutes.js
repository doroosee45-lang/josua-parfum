import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getProductById,
  getPublicProducts,
  toggleVisibility,
  updateProduct,
} from '../controllers/productController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', getPublicProducts);

// Protected vendor/admin routes
router.get('/admin', requireAdminAuth, getAdminProducts);
router.post('/', requireAdminAuth, createProduct);
router.put('/:id', requireAdminAuth, updateProduct);
router.patch('/:id/visibility', requireAdminAuth, toggleVisibility);
router.delete('/:id', requireAdminAuth, deleteProduct);

// Public product detail (kept after /admin so '/admin' isn't matched as :id)
router.get('/:id', getProductById);

export default router;
