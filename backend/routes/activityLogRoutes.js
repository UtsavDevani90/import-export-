// routes/activityLogRoutes.js
const express = require('express');
const router  = express.Router();

const { getLogs } = require('../controllers/activityLogController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ── GET /api/activity-logs   — list with filters (page, limit, action, adminId, from, to)
router.get('/', protect, adminOnly, getLogs);

module.exports = router;
