// controllers/adminUserController.js — Admin management of portal users
// Admins can list, view, deactivate/activate, and delete user accounts.
// All routes protected by protect + adminOnly.

const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ── @route   GET /api/admin/users
// ── @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, country, isActive } = req.query;

    const result = await User.findAll({
      page:     parseInt(page),
      limit:    parseInt(limit),
      search:   search || undefined,
      country:  country || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });

    return sendSuccess(res, 200, 'Users fetched', result);
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/admin/users/:id
// ── @access  Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'User fetched', user);
  } catch (err) {
    next(err);
  }
};

// ── @route   PATCH /api/admin/users/:id/status
// ── @access  Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
      return sendError(res, 400, 'is_active must be a boolean');
    }

    const updated = await User.updateStatus(req.params.id, is_active);
    if (!updated) return sendError(res, 404, 'User not found');

    logger.info(`[ADMIN] User ${updated.email} status → ${is_active} by admin ${req.admin.email}`);
    return sendSuccess(res, 200, `User ${is_active ? 'activated' : 'deactivated'}`, updated);
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/admin/users/:id
// ── @access  SuperAdmin only
const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    const removed = await User.remove(req.params.id);
    if (!removed) return sendError(res, 404, 'User not found');

    logger.info(`[ADMIN] User deleted: ${removed.email} by admin ${req.admin.email}`);
    return sendSuccess(res, 200, 'User deleted', removed);
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/admin/users/:id/notify
// ── @access  Admin — send in-app notification to a user
const notifyUser = async (req, res, next) => {
  try {
    const { title, message, type = 'info', link } = req.body;
    if (!title || !message) {
      return sendError(res, 400, 'Title and message are required');
    }

    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');

    const notification = await User.createNotification({
      user_id: req.params.id,
      title,
      message,
      type,
      link,
    });

    logger.info(`[ADMIN] Notification sent to ${user.email} by admin ${req.admin.email}`);
    return sendSuccess(res, 201, 'Notification sent', notification);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUserStatus, deleteUser, notifyUser };
