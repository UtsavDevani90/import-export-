// routes/cmsRoutes.js
const express = require('express');
const router  = express.Router();

const {
  getTestimonials, createTestimonial, updateTestimonial,
  deleteTestimonial, reorderTestimonials,
  getFaqs, createFaq, updateFaq, deleteFaq,
  getStats, updateStats,
} = require('../controllers/cmsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ── TESTIMONIALS ─────────────────────────────────────────────
// GET  /api/cms/testimonials          — public list
router.get('/testimonials',              getTestimonials);
// POST /api/cms/testimonials           — create (admin)
router.post('/testimonials',             protect, adminOnly, createTestimonial);
// PUT  /api/cms/testimonials/reorder   — reorder (admin) — must be before /:id
router.put('/testimonials/reorder',      protect, adminOnly, reorderTestimonials);
// PUT  /api/cms/testimonials/:id       — update (admin)
router.put('/testimonials/:id',          protect, adminOnly, updateTestimonial);
// DELETE /api/cms/testimonials/:id     — delete (admin)
router.delete('/testimonials/:id',       protect, adminOnly, deleteTestimonial);

// ── FAQs ─────────────────────────────────────────────────────
// GET  /api/cms/faqs                  — public list
router.get('/faqs',                      getFaqs);
// POST /api/cms/faqs                   — create (admin)
router.post('/faqs',                     protect, adminOnly, createFaq);
// PUT  /api/cms/faqs/:id              — update (admin)
router.put('/faqs/:id',                  protect, adminOnly, updateFaq);
// DELETE /api/cms/faqs/:id            — delete (admin)
router.delete('/faqs/:id',               protect, adminOnly, deleteFaq);

// ── STATS ────────────────────────────────────────────────────
// GET /api/cms/stats                  — public
router.get('/stats',                     getStats);
// PUT /api/cms/stats                   — batch update (admin)
router.put('/stats',                     protect, adminOnly, updateStats);

module.exports = router;
