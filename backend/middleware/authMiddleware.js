// middleware/authMiddleware.js — JWT authentication & role guard (PostgreSQL)
// Attach this to any route that requires a logged-in admin.
// Cookie name: admin_token (separate from user_token used by portal users)
//
// Usage:
//   router.get('/admin-only', protect, adminOnly, handler);

const jwt   = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendError } = require('../utils/apiResponse');

// ── protect — verify JWT and attach admin to req ─────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // Accept token from Authorization header OR from admin_token cookie
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.admin_token) {
      token = req.cookies.admin_token;
    }

    if (!token) {
      return sendError(res, 401, 'Not authorized — no token provided');
    }

    // Verify signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Block user tokens from accessing admin routes
    if (decoded.type === 'user') {
      return sendError(res, 403, 'Access denied — admin account required');
    }

    // Fetch fresh admin from PostgreSQL (catches disabled/deleted accounts)
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return sendError(res, 401, 'Admin account no longer exists');
    }

    if (!admin.is_active) {
      return sendError(res, 403, 'Admin account is deactivated');
    }

    req.admin = admin; // Make admin available downstream
    next();

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token — please log in again');
    }
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired — please log in again');
    }
    return sendError(res, 500, 'Authentication error');
  }
};

// ── adminOnly — allow only 'admin' or 'superadmin' roles ─────
const adminOnly = (req, res, next) => {
  if (!req.admin || !['admin', 'superadmin'].includes(req.admin.role)) {
    return sendError(res, 403, 'Access denied — admin privileges required');
  }
  next();
};

// ── superAdminOnly — restrict to superadmin ───────────────────
const superAdminOnly = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'superadmin') {
    return sendError(res, 403, 'Access denied — superadmin only');
  }
  next();
};

module.exports = { protect, adminOnly, superAdminOnly };
