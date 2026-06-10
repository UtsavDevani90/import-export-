// routes/buyerRoutes.js
const express = require('express');
const router  = express.Router();

const {
  getBuyers, getBuyer, createBuyer, updateBuyer, deleteBuyer,
} = require('../controllers/buyerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ── GET /api/buyers          — list with search/country/pagination
router.get('/',    protect, adminOnly, getBuyers);
// ── GET /api/buyers/:id      — get single buyer with history
router.get('/:id', protect, adminOnly, getBuyer);
// ── POST /api/buyers         — create buyer
router.post('/',   protect, adminOnly, createBuyer);
// ── PUT /api/buyers/:id      — update buyer
router.put('/:id', protect, adminOnly, updateBuyer);
// ── DELETE /api/buyers/:id   — delete buyer
router.delete('/:id', protect, adminOnly, deleteBuyer);

module.exports = router;
