// routes/productRoutes.js — Product CRUD routes
// Security hardened:
//   • Joi validation on create/update and query params
//   • Query param sort is whitelisted (prevents SQL injection)
//   • Audit logging on admin mutations

const express = require('express');
const router  = express.Router();
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, getAllProductsAdmin,
} = require('../controllers/productController');
const { protect, adminOnly }     = require('../middleware/authMiddleware');
const { uploadProductImage, handleUploadError } = require('../middleware/uploadMiddleware');
const { validate }               = require('../middleware/validate');
const { auditMiddleware }        = require('../middleware/auditLog');
const {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} = require('../validators/productValidators');

// ── Public ────────────────────────────────────────────────────
router.get('/',     validate(productQuerySchema, 'query'), getProducts);
router.get('/:id',  getProduct);

// ── Admin ─────────────────────────────────────────────────────
router.get('/admin/all', protect, adminOnly, getAllProductsAdmin);

router.post(
  '/',
  protect, adminOnly,
  uploadProductImage, handleUploadError,
  validate(createProductSchema),
  auditMiddleware('product.created'),
  createProduct
);

router.put(
  '/:id',
  protect, adminOnly,
  uploadProductImage, handleUploadError,
  validate(updateProductSchema),
  auditMiddleware('product.updated'),
  updateProduct
);

router.delete('/:id',
  protect, adminOnly,
  auditMiddleware('product.deleted'),
  deleteProduct
);

module.exports = router;
