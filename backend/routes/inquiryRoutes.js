// routes/inquiryRoutes.js
const express = require('express');
const router  = express.Router();
const {
  submitInquiry, getInquiries, getInquiry,
  updateInquiryStatus, deleteInquiry,
} = require('../controllers/inquiryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ── Public ───────────────────────────────────────────────────
router.post('/', submitInquiry);    // POST /api/inquiries  — contact form submission

// ── Admin ────────────────────────────────────────────────────
router.get('/',    protect, adminOnly, getInquiries);
router.get('/:id', protect, adminOnly, getInquiry);
router.put('/:id/status', protect, adminOnly, updateInquiryStatus);
router.delete('/:id', protect, adminOnly, deleteInquiry);

module.exports = router;
