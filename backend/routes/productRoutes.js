// routes/productRoutes.js
const express = require('express');
const router  = express.Router();
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, getAllProductsAdmin,
} = require('../controllers/productController');
const { protect, adminOnly }    = require('../middleware/authMiddleware');
const { uploadProductImage, handleUploadError } = require('../middleware/uploadMiddleware');

// ── Public ───────────────────────────────────────────────────
router.get('/',       getProducts);       // GET /api/products
router.get('/:id',    getProduct);        // GET /api/products/:id  (id or slug)

// ── Admin ────────────────────────────────────────────────────
router.get('/admin/all', protect, adminOnly, getAllProductsAdmin);

router.post(
  '/',
  protect, adminOnly,
  uploadProductImage, handleUploadError,
  createProduct
);

router.put(
  '/:id',
  protect, adminOnly,
  uploadProductImage, handleUploadError,
  updateProduct
);

router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
