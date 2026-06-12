// controllers/userAuthController.js — Portal user authentication
// Handles register, login, me, change-password, logout for the users table.
// Uses user_token cookie (separate from admin admin_token).

const User         = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger        = require('../utils/logger');

const COOKIE_NAME = 'user_token';
const logTag      = '[USER AUTH]';

// ── Cookie options helper ─────────────────────────────────────
const cookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

// ── @route   POST /api/users/auth/register
// ── @access  Public
const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, company_name, country } = req.body;

    if (!full_name || !email || !password) {
      return sendError(res, 400, 'Full name, email, and password are required');
    }
    if (password.length < 8) {
      return sendError(res, 400, 'Password must be at least 8 characters');
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return sendError(res, 409, 'An account with this email already exists');
    }

    const user = await User.create({ full_name, email, password, phone, company_name, country });

    // Generate token with type: 'user' to distinguish from admin tokens
    const token = generateToken({ id: user.id, role: user.role, type: 'user' });

    res.cookie(COOKIE_NAME, token, cookieOptions());

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
      token,
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/users/auth/login
// ── @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    logger.info(`${logTag} Login attempt — email: ${email || '(empty)'}`);

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    let user;
    try {
      user = await User.findByEmail(email, true);
      logger.info(`${logTag} DB lookup — user found: ${!!user}`);
    } catch (dbErr) {
      logger.error(`${logTag} DB ERROR: ${dbErr.message}`);
      return sendError(res, 500, 'Database error during authentication');
    }

    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (!user.is_active) {
      return sendError(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    let passwordMatch = false;
    try {
      passwordMatch = await User.comparePassword(password, user.password_hash);
      logger.info(`${logTag} Password match: ${passwordMatch}`);
    } catch (bcryptErr) {
      logger.error(`${logTag} bcrypt ERROR: ${bcryptErr.message}`);
      return sendError(res, 500, 'Authentication error');
    }

    if (!passwordMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const updated = await User.updateLastLogin(user.id);

    const token = generateToken({ id: user.id, role: user.role, type: 'user' });

    res.cookie(COOKIE_NAME, token, cookieOptions());

    logger.info(`${logTag} Login SUCCESS: ${email}`);

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
      token,
    });
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

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Current and new password are required');
    }
    if (newPassword.length < 8) {
      return sendError(res, 400, 'New password must be at least 8 characters');
    }

    const user = await User.findById(req.user.id, true);
    if (!user) return sendError(res, 404, 'User not found');

    const match = await User.comparePassword(currentPassword, user.password_hash);
    if (!match) {
      return sendError(res, 401, 'Current password is incorrect');
    }

    await User.updatePassword(user.id, newPassword);

    return sendSuccess(res, 200, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/users/auth/logout
// ── @access  Private
const logout = (req, res) => {
  res.cookie(COOKIE_NAME, '', { expires: new Date(0), httpOnly: true });
  return sendSuccess(res, 200, 'Logged out successfully');
};

module.exports = { register, login, getMe, changePassword, logout };
