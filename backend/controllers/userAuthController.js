// controllers/userAuthController.js — Portal user authentication
// Security hardened:
//   • Account lockout after 5 failed attempts
//   • Constant-time compare prevents user enumeration
//   • Refresh token rotation support
//   • Logout clears cookie with correct flags

const User         = require('../models/User');
const bcrypt       = require('bcryptjs');
const {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  consumeRefreshToken,
  revokeAllRefreshTokens,
}                  = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger       = require('../utils/logger');
const { logSecurityEvent } = require('../middleware/auditLog');
const {
  recordFailedAttempt,
  resetFailedAttempts,
}                  = require('../middleware/loginLockout');

const ACCESS_COOKIE_NAME  = 'user_token';
const REFRESH_COOKIE_NAME = 'user_refresh_token';
const ACCESS_MAX_AGE      = 15 * 60 * 1000;
const REFRESH_MAX_AGE     = 7 * 24 * 60 * 60 * 1000;
const logTag              = '[USER AUTH]';

// ── Cookie options ─────────────────────────────────────────────
const cookieOptions = (maxAge) => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge,
  };
};

// ── @route   POST /api/users/auth/register
// ── @access  Public
const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, company_name, country } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return sendError(res, 409, 'An account with this email already exists');
    }

    const user = await User.create({ full_name, email, password, phone, company_name, country });

    const payload      = { id: user.id, role: user.role, type: 'user' };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await storeRefreshToken({
      rawToken:    refreshToken,
      userId:      user.id,
      accountType: 'user',
      ip:          req.ip,
      userAgent:   req.get('user-agent'),
    });

    res.cookie(ACCESS_COOKIE_NAME,  accessToken,  cookieOptions(ACCESS_MAX_AGE));
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions(REFRESH_MAX_AGE));

    logger.info(`${logTag} New user registered: ${email}`);

    return sendSuccess(res, 201, 'Account created successfully', {
      user: {
        id:           user.id,
        full_name:    user.full_name,
        email:        user.email,
        phone:        user.phone,
        company_name: user.company_name,
        country:      user.country,
        role:         user.role,
      },
      token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/users/auth/login
// ── @access  Public (protected by rate limiter + lockout middleware)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    logger.info(`${logTag} Login attempt — email: ${email || '(empty)'}`);

    // ── Constant-time compare to prevent user enumeration ─────
    const DUMMY_HASH = '$2a$12$dummy.hash.to.prevent.timing.attacks.padding.xx';

    let user;
    try {
      user = await User.findByEmail(email, true);
    } catch (dbErr) {
      logger.error(`${logTag} DB ERROR: ${dbErr.message}`);
      return sendError(res, 500, 'Database error during authentication');
    }

    const hashToCheck = user?.password_hash || DUMMY_HASH;
    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, hashToCheck);
    } catch (bcryptErr) {
      logger.error(`${logTag} bcrypt ERROR: ${bcryptErr.message}`);
      return sendError(res, 500, 'Authentication error');
    }

    if (!user || !passwordMatch) {
      if (user) await recordFailedAttempt('users', email);
      logSecurityEvent({ action: 'user.login_failed', email, ip: req.ip });
      logger.warn(`${logTag} Failed login for: ${email}`);
      return sendError(res, 401, 'Invalid email or password');
    }

    if (!user.is_active) {
      logSecurityEvent({ action: 'user.login_blocked_inactive', email, ip: req.ip });
      return sendError(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    await resetFailedAttempts('users', email);
    const updated = await User.updateLastLogin(user.id);

    const payload      = { id: user.id, role: user.role, type: 'user' };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await storeRefreshToken({
      rawToken:    refreshToken,
      userId:      user.id,
      accountType: 'user',
      ip:          req.ip,
      userAgent:   req.get('user-agent'),
    });

    res.cookie(ACCESS_COOKIE_NAME,  accessToken,  cookieOptions(ACCESS_MAX_AGE));
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions(REFRESH_MAX_AGE));

    logger.info(`${logTag} Login SUCCESS: ${email}`);
    logSecurityEvent({ action: 'user.login_success', userId: user.id, email, ip: req.ip });

    return sendSuccess(res, 200, 'Login successful', {
      user: {
        id:           updated.id,
        full_name:    updated.full_name,
        email:        updated.email,
        phone:        updated.phone,
        company_name: updated.company_name,
        country:      updated.country,
        role:         updated.role,
        lastLogin:    updated.last_login,
      },
      token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/users/auth/refresh
// ── @access  Public (refresh token cookie required)
const refresh = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
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

    // Consume and rotate (one-time use)
    const stored = await consumeRefreshToken(rawRefreshToken);
    if (!stored) {
      logSecurityEvent({ action: 'user.refresh_token_reuse_detected', userId: decoded.id, ip: req.ip });
      return sendError(res, 401, 'Refresh token already used or revoked — please log in again');
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
      return sendError(res, 401, 'Account no longer exists or is deactivated');
    }

    const payload         = { id: user.id, role: user.role, type: 'user' };
    const newAccessToken  = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await storeRefreshToken({
      rawToken:    newRefreshToken,
      userId:      user.id,
      accountType: 'user',
      ip:          req.ip,
      userAgent:   req.get('user-agent'),
    });

    res.cookie(ACCESS_COOKIE_NAME,  newAccessToken,  cookieOptions(ACCESS_MAX_AGE));
    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, cookieOptions(REFRESH_MAX_AGE));

    return sendSuccess(res, 200, 'Token refreshed', { token: newAccessToken });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/users/auth/me
// ── @access  Private (userProtect)
const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'Profile fetched', req.user);
};

// ── @route   PUT /api/users/auth/change-password
// ── @access  Private (userProtect)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id, true);
    if (!user) return sendError(res, 404, 'User not found');

    const match = await User.comparePassword(currentPassword, user.password_hash);
    if (!match) {
      logSecurityEvent({ action: 'user.change_password_failed', userId: user.id, ip: req.ip });
      return sendError(res, 401, 'Current password is incorrect');
    }

    await User.updatePassword(user.id, newPassword);

    logSecurityEvent({ action: 'user.password_changed', userId: user.id, ip: req.ip });
    logger.info(`${logTag} Password changed for: ${user.email}`);

    return sendSuccess(res, 200, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/users/auth/logout
// ── @access  Private
const logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const clearOpts = {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires:  new Date(0),
  };

  if (req.user?.id) {
    await revokeAllRefreshTokens({ userId: req.user.id });
    logSecurityEvent({ action: 'user.logout', userId: req.user.id, ip: req.ip });
  }

  res.cookie(ACCESS_COOKIE_NAME,  '', clearOpts);
  res.cookie(REFRESH_COOKIE_NAME, '', clearOpts);

  return sendSuccess(res, 200, 'Logged out successfully');
};

module.exports = { register, login, refresh, getMe, changePassword, logout };
