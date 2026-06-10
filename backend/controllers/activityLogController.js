// controllers/activityLogController.js — Admin activity log (PostgreSQL)
// Read-only endpoint for auditing admin actions.

const ActivityLog = require('../models/ActivityLog');
const { sendSuccess } = require('../utils/apiResponse');

// ── @route   GET /api/activity-logs
// ── @desc    List activity logs with filtering and pagination
// ── @query   page, limit, action, adminId, from (ISO date), to (ISO date)
// ── @access  Private/Admin
const getLogs = async (req, res, next) => {
  try {
    const {
      page    = 1,
      limit   = 50,
      action,
      adminId,
      from,
      to,
    } = req.query;

    const filter = {};
    if (action)  filter.action  = action;
    if (adminId) filter.adminId = adminId;
    if (from)    filter.from    = from;
    if (to)      filter.to      = to;

    const total = await ActivityLog.countTotal(filter);
    const logs  = await ActivityLog.findAll({
      page:  parseInt(page),
      limit: parseInt(limit),
      ...filter,
    });

    return sendSuccess(res, 200, 'Activity logs fetched', {
      logs,
      pagination: {
        total,
        page:  parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLogs };
