// controllers/authController.js — Admin authentication (PostgreSQL)
// Security hardened:
//   • Account lockout after 5 failed attempts
//   • Constant-time compare prevents user enumeration
//   • All console.log replaced with logger
//   • Debug endpoint removed in production
//   • Refresh token rotation support
//   • Logout clears cookie with correct SameSite/Secure flags
//   • Register forces role='admin', gated by ALLOW_ADMIN_REGISTER env var

const Admin         = require('../models/Admin');
const bcrypt        = require('bcryptjs');
const {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  consumeRefreshToken,
  revokeAllRefreshTokens,
}                   = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger        = require('../utils/logger');
const { logSecurityEvent } = require('../middleware/auditLog');
const {
  recordFailedAttempt,
  resetFailedAttempts,
}                   = require('../middleware/loginLockout');

// ── Cookie options helper ─────────────────────────────────────
const cookieOptions = (maxAge) => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge,
  };
};

const ACCESS_COOKIE_MAX_AGE  = 15 * 60 * 1000;        // 15 min
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── @route   POST /api/auth/register
// ── @access  Gated by ALLOW_ADMIN_REGISTER=true env var
const register = async (req, res, next) => {
  try {
    // Gate: disabled in production unless explicitly allowed
    if (process.env.ALLOW_ADMIN_REGISTER !== 'true') {
      return sendError(res, 403, 'Admin registration is disabled. Contact the system administrator.');
    }

    const { name, email, password } = req.body;

    // Always force 'admin' — only superadmin upgrade is via /api/admins/:id/role
    const safeRole = 'admin';

    // Prevent duplicate accounts
    const existing = await Admin.findByEmail(email);
    if (existing) {
      return sendError(res, 409, 'An admin with this email already exists');
    }

    const admin = await Admin.create({ name, email, password, role: safeRole });
    const accessToken = generateAccessToken({ id: admin.id, role: admin.role, type: 'admin' });

    logger.info(`[AUTH] New admin registered: ${email} | role: ${safeRole}`);

    logSecurityEvent({
      action:    'admin.registered',
      adminId:   admin.id,
      adminName: admin.name,
      ip:        req.ip,
    });

    return sendSuccess(res, 201, 'Admin registered successfully', { admin, token: accessToken });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/auth/login
// ── @access  Public (protected by rate limiter + lockout middleware)
const login = async (req, res, next) => {
  const logTag = '[AUTH LOGIN]';
  try {
    const { email, password } = req.body;

    logger.info(`${logTag} Attempt — email: ${email || '(empty)'}`);

    // ── Step 1: Look up admin ─────────────────────────────────
    const admin = await Admin.findByEmail(email, true).catch((dbErr) => {
      logger.error(`${logTag} DB ERROR during findByEmail: ${dbErr.message}`);
      return null;
    });

    // ── Constant-time compare: always bcrypt.compare even for missing users
    //    This prevents timing attacks that enumerate valid emails
    const DUMMY_HASH = '$2a$12$dummy.hash.to.prevent.timing.attacks.padding.xx';
    const passwordToCheck = admin?.password || DUMMY_HASH;

    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, passwordToCheck);
    } catch (bcryptErr) {
      logger.error(`${logTag} bcrypt ERROR: ${bcryptErr.message}`);
      return sendError(res, 500, 'Authentication error');
    }

    // Single generic error — no information about whether email or password is wrong
    if (!admin || !passwordMatch) {
      if (admin) {
        await recordFailedAttempt('admins', email);
      }
      logSecurityEvent({
        action: 'admin.login_failed',
        email,
        ip:     req.ip,
        reason: admin ? 'wrong_password' : 'user_not_found',
      });
      logger.warn(`${logTag} Failed login for: ${email} | IP: ${req.ip}`);
      return sendError(res, 401, 'Invalid email or password');
    }

    // ── Step 2: Check account is active ──────────────────────
    if (!admin.is_active) {
      logSecurityEvent({ action: 'admin.login_blocked_inactive', email, ip: req.ip });
      logger.warn(`${logTag} Account deactivated: ${email}`);
      return sendError(res, 403, 'Your account has been deactivated');
    }

    // ── Step 3: Reset lockout counter on successful auth ──────
    await resetFailedAttempts('admins', email);

    // ── Step 4: Update last login ─────────────────────────────
    const updated = await Admin.updateLastLogin(admin.id);

    // ── Step 5: Generate tokens ───────────────────────────────
    const payload      = { id: admin.id, role: admin.role, type: 'admin' };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token hash in DB
    await storeRefreshToken({
      rawToken:    refreshToken,
      adminId:     admin.id,
      accountType: 'admin',
      ip:          req.ip,
      userAgent:   req.get('user-agent'),
    });

    // ── Step 6: Set cookies ───────────────────────────────────
    res.cookie('admin_token',         accessToken,  cookieOptions(ACCESS_COOKIE_MAX_AGE));
    res.cookie('admin_refresh_token', refreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE));

    logger.info(`${logTag} Login SUCCESS: ${email} | role: ${admin.role}`);
    logSecurityEvent({ action: 'admin.login_success', adminId: admin.id, email, ip: req.ip });

    return sendSuccess(res, 200, 'Login successful', {
      admin: {
        id:        updated.id,
        name:      updated.name,
        email:     updated.email,
        role:      updated.role,
        lastLogin: updated.last_login,
      },
      token: accessToken, // Still returned for localStorage-based frontends
    });
  } catch (err) {
    logger.error(`${logTag} Unhandled error: ${err.message}`);
    next(err);
  }
};

// ── @route   POST /api/auth/refresh
// ── @access  Public (refresh token cookie required)
const refresh = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.admin_refresh_token;
    if (!rawRefreshToken) {
      return sendError(res, 401, 'Refresh token not found — please log in again');
    }

    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(rawRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return sendError(res, 401, 'Refresh token invalid or expired — please log in again');
    }

    // Consume and rotate the refresh token (one-time use)
    const storedToken = await consumeRefreshToken(rawRefreshToken);
    if (!storedToken) {
      logSecurityEvent({ action: 'admin.refresh_token_reuse_detected', adminId: decoded.id, ip: req.ip });
      return sendError(res, 401, 'Refresh token already used or revoked — please log in again');
    }

    // Verify admin still exists and is active
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.is_active) {
      return sendError(res, 401, 'Account no longer exists or is deactivated');
    }

    // Issue new token pair
    const payload         = { id: admin.id, role: admin.role, type: 'admin' };
    const newAccessToken  = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await storeRefreshToken({
      rawToken:    newRefreshToken,
      adminId:     admin.id,
      accountType: 'admin',
      ip:          req.ip,
      userAgent:   req.get('user-agent'),
    });

    res.cookie('admin_token',         newAccessToken,  cookieOptions(ACCESS_COOKIE_MAX_AGE));
    res.cookie('admin_refresh_token', newRefreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE));

    return sendSuccess(res, 200, 'Token refreshed', { token: newAccessToken });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/auth/me
// ── @access  Private
const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'Profile fetched', req.admin);
};

// ── @route   PUT /api/auth/change-password
// ── @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Fetch admin WITH password hash for comparison
    const admin = await Admin.findById(req.admin.id, true);

    if (!(await Admin.comparePassword(currentPassword, admin.password))) {
      logSecurityEvent({ action: 'admin.change_password_failed', adminId: admin.id, ip: req.ip });
      return sendError(res, 401, 'Current password is incorrect');
    }

    await Admin.updatePassword(admin.id, newPassword);

    logSecurityEvent({ action: 'admin.password_changed', adminId: admin.id, ip: req.ip });
    logger.info(`[AUTH] Password changed for admin: ${admin.email}`);

    return sendSuccess(res, 200, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/auth/logout
// ── @access  Private
const logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const clearOpts = {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires:  new Date(0),
  };

  // Revoke all refresh tokens for this admin
  if (req.admin?.id) {
    await revokeAllRefreshTokens({ adminId: req.admin.id });
    logSecurityEvent({ action: 'admin.logout', adminId: req.admin.id, ip: req.ip });
  }

  res.cookie('admin_token',         '', clearOpts);
  res.cookie('admin_refresh_token', '', clearOpts);

  return sendSuccess(res, 200, 'Logged out successfully');
};

// ── @route   GET /api/auth/debug-connection
// ── @access  REMOVED in production — returns 404
const debugConnection = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  // Development only
  const { pool } = require('../config/db');
  try {
    const { rows: tableCheck } = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='admins'`
    );
    const { rows: countRows } = await pool.query(`SELECT COUNT(*) AS cnt FROM admins`);
    return res.json({
      success:           true,
      dbConnected:       true,
      adminsTableExists: tableCheck.length > 0,
      adminCount:        parseInt(countRows[0].cnt, 10),
      nodeEnv:           process.env.NODE_ENV,
      jwtSecretSet:      !!process.env.JWT_SECRET,
      // Never expose actual values, only boolean presence
    });
  } catch (err) {
    return res.status(500).json({ success: false, dbConnected: false, error: err.message });
  }
};

module.exports = { register, login, refresh, getMe, changePassword, logout, debugConnection };
