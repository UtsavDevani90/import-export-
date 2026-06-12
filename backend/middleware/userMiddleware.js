// middleware/userMiddleware.js — JWT authentication for portal users
// Parallel to authMiddleware.js but targets the `users` table.
// Uses `user_token` cookie (separate namespace from admin_token).

const jwt          = require('jsonwebtoken');
const User         = require('../models/User');
const Admin        = require('../models/Admin');
const { sendError } = require('../utils/apiResponse');

// ── Extract raw token from request ───────────────────────────
const extractToken = (req, cookieName) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return req.cookies?.[cookieName] || null;
};

// ── userProtect — verify user_token and attach req.user ──────
const userProtect = async (req, res, next) => {
  try {
    const token = extractToken(req, 'user_token');

    if (!token) {
      return sendError(res, 401, 'Not authorized — please log in');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm this is a user token (not an admin token)
    if (decoded.type !== 'user') {
      return sendError(res, 403, 'Access denied — user account required');
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, 'User account no longer exists');
    }

    if (!user.is_active) {
      return sendError(res, 403, 'Your account has been deactivated. Contact support.');
    }

    req.user = user;
    next();

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token — please log in again');
    }
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session expired — please log in again');
    }
    return sendError(res, 500, 'Authentication error');
  }
};

// ── userOnly — block non-user roles ──────────────────────────
const userOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'user') {
    return sendError(res, 403, 'Access denied — user account required');
  }
  next();
};

// ── anyAuth — accepts EITHER admin or user token ─────────────
// Attaches req.currentUser = { ...profile, accountType: 'admin'|'user' }
// Use on shared read-only routes (e.g. product catalog for logged-in users)
const anyAuth = async (req, res, next) => {
  try {
    // Try admin token first
    const adminToken = extractToken(req, 'admin_token');
    if (adminToken) {
      try {
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        if (decoded.type !== 'user') {
          const admin = await Admin.findById(decoded.id);
          if (admin && admin.is_active) {
            req.currentUser = { ...admin, accountType: 'admin' };
            req.admin = admin;
            return next();
          }
        }
      } catch { /* fall through to user token */ }
    }

    // Try user token
    const userToken = extractToken(req, 'user_token');
    if (userToken) {
      try {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
        if (decoded.type === 'user') {
          const user = await User.findById(decoded.id);
          if (user && user.is_active) {
            req.currentUser = { ...user, accountType: 'user' };
            req.user = user;
            return next();
          }
        }
      } catch { /* no valid token */ }
    }

    return sendError(res, 401, 'Not authorized — please log in');

  } catch (err) {
    return sendError(res, 500, 'Authentication error');
  }
};

// ── optionalAuth — attach user/admin if token present, else continue ─
// Use on public routes that show extra features when logged in
const optionalAuth = async (req, res, next) => {
  try {
    const adminToken = extractToken(req, 'admin_token');
    if (adminToken) {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
      if (decoded.type !== 'user') {
        const admin = await Admin.findById(decoded.id);
        if (admin?.is_active) { req.admin = admin; req.currentUser = { ...admin, accountType: 'admin' }; }
      }
    }
  } catch { /* ignore */ }

  if (!req.currentUser) {
    try {
      const userToken = extractToken(req, 'user_token');
      if (userToken) {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
        if (decoded.type === 'user') {
          const user = await User.findById(decoded.id);
          if (user?.is_active) { req.user = user; req.currentUser = { ...user, accountType: 'user' }; }
        }
      }
    } catch { /* ignore */ }
  }

  next();
};

module.exports = { userProtect, userOnly, anyAuth, optionalAuth };
