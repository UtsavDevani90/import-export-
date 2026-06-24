// routes/blogRoutes.js — Blog CRUD routes
// Security hardened:
//   • Joi validation on create/update
//   • Rich HTML content sanitized before save (sanitizeRichBody)
//   • Audit logging on admin mutations

const express = require('express');
const router  = express.Router();
const {
  getBlogs, getBlog, createBlog, updateBlog, deleteBlog, getAllBlogsAdmin,
} = require('../controllers/blogController');
const { protect, adminOnly }   = require('../middleware/authMiddleware');
const { uploadSingleImage, handleUploadError } = require('../middleware/uploadMiddleware');
const { validate }             = require('../middleware/validate');
const { sanitizeRichBody }     = require('../middleware/sanitize');
const { auditMiddleware }      = require('../middleware/auditLog');
const {
  createBlogSchema,
  updateBlogSchema,
  blogQuerySchema,
} = require('../validators/blogValidators');

// ── Public ────────────────────────────────────────────────────
router.get('/',      validate(blogQuerySchema, 'query'), getBlogs);
router.get('/:slug', getBlog);

// ── Admin ─────────────────────────────────────────────────────
router.get('/admin/all', protect, adminOnly, getAllBlogsAdmin);

router.post(
  '/',
  protect, adminOnly,
  uploadSingleImage, handleUploadError,
  validate(createBlogSchema),
  sanitizeRichBody(['content', 'excerpt']),   // Sanitize HTML content
  auditMiddleware('blog.created'),
  createBlog
);

router.put(
  '/:id',
  protect, adminOnly,
  uploadSingleImage, handleUploadError,
  validate(updateBlogSchema),
  sanitizeRichBody(['content', 'excerpt']),   // Sanitize HTML content
  auditMiddleware('blog.updated'),
  updateBlog
);

router.delete('/:id',
  protect, adminOnly,
  auditMiddleware('blog.deleted'),
  deleteBlog
);

module.exports = router;
