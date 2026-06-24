// routes/inquiryRoutes.js — Contact/inquiry form routes
// Security hardened:
//   • Joi validation on submit (prevents injection + sets length limits)
//   • Cloudflare Turnstile bot protection on public submit
//   • Sanitize plain text fields before storage
//   • Dedicated rate limiter applied in server.js

const express = require('express');
const router  = express.Router();
const {
  submitInquiry, getInquiries, getInquiry,
  updateInquiryStatus, deleteInquiry,
  addInquiryNote, getInquiryNotes,
} = require('../controllers/inquiryController');
const { protect, adminOnly }     = require('../middleware/authMiddleware');
const { validate }               = require('../middleware/validate');
const { sanitizeBody }           = require('../middleware/sanitize');
const { verifyTurnstile }        = require('../middleware/turnstile');
const {
  submitInquirySchema,
  updateInquiryStatusSchema,
  addInquiryNoteSchema,
} = require('../validators/inquiryValidators');

// ── Public ────────────────────────────────────────────────────
router.post('/',
  verifyTurnstile,                                          // Bot check
  validate(submitInquirySchema),                            // Schema validation
  sanitizeBody(['name', 'company', 'message', 'subject']), // Strip XSS
  submitInquiry
);

// ── Admin ─────────────────────────────────────────────────────
router.get('/',     protect, adminOnly, getInquiries);
router.get('/:id',  protect, adminOnly, getInquiry);
router.put('/:id/status',
  protect, adminOnly,
  validate(updateInquiryStatusSchema),
  updateInquiryStatus
);
router.delete('/:id', protect, adminOnly, deleteInquiry);

// ── Inquiry Notes ─────────────────────────────────────────────
router.post('/:id/notes',
  protect, adminOnly,
  validate(addInquiryNoteSchema),
  addInquiryNote
);
router.get('/:id/notes', protect, adminOnly, getInquiryNotes);

module.exports = router;
