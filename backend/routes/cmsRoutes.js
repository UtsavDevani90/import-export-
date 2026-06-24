// routes/cmsRoutes.js — CMS routes (testimonials, FAQs, stats)
// Security hardened:
//   • Joi validation on all write operations
//   • XSS sanitization on text content
//   • Audit logging on mutations

const express = require('express');
const router  = express.Router();

const {
  getTestimonials, createTestimonial, updateTestimonial,
  deleteTestimonial, reorderTestimonials,
  getFaqs, createFaq, updateFaq, deleteFaq,
  getStats, updateStats,
} = require('../controllers/cmsController');
const { protect, adminOnly }     = require('../middleware/authMiddleware');
const { validate }               = require('../middleware/validate');
const { sanitizeBody }           = require('../middleware/sanitize');
const { auditMiddleware }        = require('../middleware/auditLog');
const {
  createTestimonialSchema,
  updateTestimonialSchema,
  createFaqSchema,
  updateFaqSchema,
  updateStatsSchema,
  reorderSchema,
} = require('../validators/cmsValidators');

// ── TESTIMONIALS ──────────────────────────────────────────────
router.get('/testimonials', getTestimonials);

router.post('/testimonials',
  protect, adminOnly,
  validate(createTestimonialSchema),
  sanitizeBody(['content', 'client_name', 'client_company']),
  auditMiddleware('cms.testimonial.created'),
  createTestimonial
);

router.put('/testimonials/reorder',
  protect, adminOnly,
  validate(reorderSchema),
  reorderTestimonials
);

router.put('/testimonials/:id',
  protect, adminOnly,
  validate(updateTestimonialSchema),
  sanitizeBody(['content', 'client_name', 'client_company']),
  auditMiddleware('cms.testimonial.updated'),
  updateTestimonial
);

router.delete('/testimonials/:id',
  protect, adminOnly,
  auditMiddleware('cms.testimonial.deleted'),
  deleteTestimonial
);

// ── FAQs ──────────────────────────────────────────────────────
router.get('/faqs', getFaqs);

router.post('/faqs',
  protect, adminOnly,
  validate(createFaqSchema),
  sanitizeBody(['question', 'answer']),
  auditMiddleware('cms.faq.created'),
  createFaq
);

router.put('/faqs/:id',
  protect, adminOnly,
  validate(updateFaqSchema),
  sanitizeBody(['question', 'answer']),
  auditMiddleware('cms.faq.updated'),
  updateFaq
);

router.delete('/faqs/:id',
  protect, adminOnly,
  auditMiddleware('cms.faq.deleted'),
  deleteFaq
);

// ── STATS ─────────────────────────────────────────────────────
router.get('/stats', getStats);

router.put('/stats',
  protect, adminOnly,
  validate(updateStatsSchema),
  auditMiddleware('cms.stats.updated'),
  updateStats
);

module.exports = router;
