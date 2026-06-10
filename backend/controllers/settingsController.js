// controllers/settingsController.js — Application settings management (PostgreSQL)
// Admin CRUD for key-value settings grouped by category.

const Setting     = require('../models/Setting');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ── @route   GET /api/settings
// ── @desc    Get all settings grouped by group_name
// ── @access  Private/Admin
const getSettings = async (req, res, next) => {
  try {
    const all = await Setting.getAll();

    // Group by group_name for easier frontend consumption
    const grouped = {};
    for (const row of all) {
      const group = row.group_name || 'general';
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(row);
    }

    return sendSuccess(res, 200, 'Settings fetched', { settings: all, grouped });
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/settings
// ── @desc    Bulk update settings — body: { updates: [{key, value}] }
// ── @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return sendError(res, 400, 'updates must be a non-empty array of { key, value }');
    }

    // Validate that each update has a key
    const invalid = updates.filter(u => !u.key);
    if (invalid.length > 0) {
      return sendError(res, 400, 'Each update must include a key');
    }

    const results = await Setting.setBulk(updates);

    await ActivityLog.insert({
      adminId:     req.admin.id,
      adminName:   req.admin.name,
      action:      'settings.updated',
      entityType:  'settings',
      entityId:    null,
      entityLabel: `${updates.length} setting(s)`,
      details:     { keys: updates.map(u => u.key) },
      ipAddress:   req.ip,
    }).catch(() => {});

    return sendSuccess(res, 200, 'Settings updated successfully', results);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };
