// routes/quotationRoutes.js
const express = require('express');
const router  = express.Router();

const {
  getQuotations, getQuotation, createQuotation,
  updateQuotation, deleteQuotation, getQuotationPdf,
} = require('../controllers/quotationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ── GET  /api/quotations           — list with filters
router.get('/',          protect, adminOnly, getQuotations);
// ── GET  /api/quotations/:id       — single quotation with items
router.get('/:id',       protect, adminOnly, getQuotation);
// ── GET  /api/quotations/:id/pdf   — print-ready HTML invoice
router.get('/:id/pdf',   protect, adminOnly, getQuotationPdf);
// ── POST /api/quotations           — create quotation + items
router.post('/',         protect, adminOnly, createQuotation);
// ── PUT  /api/quotations/:id       — update quotation + items
router.put('/:id',       protect, adminOnly, updateQuotation);
// ── DELETE /api/quotations/:id     — delete quotation
router.delete('/:id',    protect, adminOnly, deleteQuotation);

module.exports = router;
