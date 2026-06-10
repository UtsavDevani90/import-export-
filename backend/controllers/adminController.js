// controllers/adminController.js — Admin accounts management (PostgreSQL)
// Admin CRUD for superadmins to manage admin users.

const Admin       = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ── @route   GET /api/admins
// ── @desc    List all admin users (Superadmin only)
// ── @access  Private/Superadmin
const getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.findAll();
    return sendSuccess(res, 200, 'Admins list fetched', admins);
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/admins/:id/status
// ── @desc    Activate or deactivate an admin (Superadmin only)
// ── @access  Private/Superadmin
const updateAdminStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return sendError(res, 400, 'isActive must be a boolean');
    }

    // Protect self-deactivation
    if (req.params.id === req.admin.id) {
      return sendError(res, 400, 'You cannot deactivate your own account');
    }

    const admin = await Admin.updateStatus(req.params.id, isActive);
    if (!admin) return sendError(res, 404, 'Admin not found');

    await ActivityLog.insert({
      adminId:     req.admin.id,
      adminName:   req.admin.name,
      action:      'admin.status_updated',
      entityType:  'admin',
      entityId:    admin.id,
      entityLabel: admin.name,
      details:     { isActive },
      ipAddress:   req.ip,
    }).catch(() => {});

    return sendSuccess(res, 200, 'Admin status updated successfully', admin);
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/admins/:id/role
// ── @desc    Update admin role (Superadmin only)
// ── @access  Private/Superadmin
const updateAdminRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'superadmin'].includes(role)) {
      return sendError(res, 400, 'Invalid role. Must be admin or superadmin');
    }

    // Protect self-role updates
    if (req.params.id === req.admin.id) {
      return sendError(res, 400, 'You cannot change your own role');
    }

    const admin = await Admin.updateRole(req.params.id, role);
    if (!admin) return sendError(res, 404, 'Admin not found');

    await ActivityLog.insert({
      adminId:     req.admin.id,
      adminName:   req.admin.name,
      action:      'admin.role_updated',
      entityType:  'admin',
      entityId:    admin.id,
      entityLabel: admin.name,
      details:     { role },
      ipAddress:   req.ip,
    }).catch(() => {});

    return sendSuccess(res, 200, 'Admin role updated successfully', admin);
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/admins/:id
// ── @desc    Delete an admin account (Superadmin only)
// ── @access  Private/Superadmin
const deleteAdmin = async (req, res, next) => {
  try {
    // Protect self-deletion
    if (req.params.id === req.admin.id) {
      return sendError(res, 400, 'You cannot delete your own account');
    }

    const admin = await Admin.remove(req.params.id);
    if (!admin) return sendError(res, 404, 'Admin not found');

    await ActivityLog.insert({
      adminId:     req.admin.id,
      adminName:   req.admin.name,
      action:      'admin.deleted',
      entityType:  'admin',
      entityId:    req.params.id,
      entityLabel: admin.name,
      details:     { email: admin.email },
      ipAddress:   req.ip,
    }).catch(() => {});

    return sendSuccess(res, 200, 'Admin deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdmins,
  updateAdminStatus,
  updateAdminRole,
  deleteAdmin
};
