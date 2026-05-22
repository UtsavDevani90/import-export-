// routes/blogRoutes.js
const express = require('express');
const router  = express.Router();
const {
  getBlogs, getBlog, createBlog, updateBlog, deleteBlog, getAllBlogsAdmin,
} = require('../controllers/blogController');
const { protect, adminOnly }   = require('../middleware/authMiddleware');
const { uploadSingleImage, handleUploadError } = require('../middleware/uploadMiddleware');

// ── Public ───────────────────────────────────────────────────
router.get('/',      getBlogs);   // GET /api/blogs
router.get('/:slug', getBlog);    // GET /api/blogs/:slug

// ── Admin ────────────────────────────────────────────────────
router.get('/admin/all', protect, adminOnly, getAllBlogsAdmin);

router.post(
  '/',
  protect, adminOnly,
  uploadSingleImage, handleUploadError,
  createBlog
);

router.put(
  '/:id',
  protect, adminOnly,
  uploadSingleImage, handleUploadError,
  updateBlog
);

router.delete('/:id', protect, adminOnly, deleteBlog);

module.exports = router;
