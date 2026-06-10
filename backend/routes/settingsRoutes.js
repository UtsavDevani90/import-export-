// routes/settingsRoutes.js
const express = require('express');
const router  = express.Router();

const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ── GET /api/settings    — get all settings grouped by group_name
router.get('/', protect, adminOnly, getSettings);
// ── PUT /api/settings    — bulk update settings
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;
