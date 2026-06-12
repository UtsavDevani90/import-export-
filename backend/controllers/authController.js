// controllers/authController.js — Admin authentication (PostgreSQL)
// Handles registration, login, profile, and logout.

const Admin         = require('../models/Admin');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger        = require('../utils/logger');

// ── @route   POST /api/auth/register
// ── @access  Public (disable or protect after first admin is created)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required');
    }

    // Prevent duplicate accounts
    const existing = await Admin.findByEmail(email);
    if (existing) {
      return sendError(res, 409, 'An admin with this email already exists');
    }

    const admin = await Admin.create({ name, email, password, role });
    const token = generateToken({ id: admin.id, role: admin.role });

    logger.info(`New admin registered: ${email}`);

    return sendSuccess(res, 201, 'Admin registered successfully', { admin, token });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/auth/login
// ── @access  Public
const login = async (req, res, next) => {
  const logTag = '[AUTH LOGIN]';
  try {
    const { email, password } = req.body;

    logger.info(`${logTag} Attempt — email: ${email || '(empty)'}`);
    console.log(`${logTag} Attempt — email: ${email || '(empty)'} | NODE_ENV: ${process.env.NODE_ENV}`);

    if (!email || !password) {
      logger.warn(`${logTag} Missing email or password`);
      return sendError(res, 400, 'Email and password are required');
    }

    // ── Step 1: Look up admin by email (includes password hash) ──
    let admin;
    try {
      admin = await Admin.findByEmail(email, true);
      logger.info(`${logTag} DB lookup — admin found: ${!!admin}`);
      console.log(`${logTag} DB lookup — admin found: ${!!admin}`);
    } catch (dbErr) {
      logger.error(`${logTag} DB ERROR during findByEmail: ${dbErr.message}`);
      console.error(`${logTag} DB ERROR:`, dbErr.message, dbErr.stack);
      return sendError(res, 500, 'Database error during authentication');
    }

    if (!admin) {
      logger.warn(`${logTag} No admin found for email: ${email}`);
      return sendError(res, 401, 'Invalid email or password');
    }

    // ── Step 2: Check account is active ──────────────────────────
    if (!admin.is_active) {
      logger.warn(`${logTag} Account deactivated: ${email}`);
      return sendError(res, 403, 'Your account has been deactivated');
    }

    // ── Step 3: Compare password ──────────────────────────────────
    let passwordMatch = false;
    try {
      passwordMatch = await Admin.comparePassword(password, admin.password);
      logger.info(`${logTag} Password match: ${passwordMatch}`);
      console.log(`${logTag} Password match: ${passwordMatch} | hash prefix: ${admin.password?.substring(0, 10)}`);
    } catch (bcryptErr) {
      logger.error(`${logTag} bcrypt ERROR: ${bcryptErr.message}`);
      console.error(`${logTag} bcrypt ERROR:`, bcryptErr.message);
      return sendError(res, 500, 'Authentication error');
    }

    if (!passwordMatch) {
      logger.warn(`${logTag} Password mismatch for: ${email}`);
      return sendError(res, 401, 'Invalid email or password');
    }

    // ── Step 4: Update last login ─────────────────────────────────
    const updated = await Admin.updateLastLogin(admin.id);

    // ── Step 5: Generate JWT ──────────────────────────────────────
    let token;
    try {
      token = generateToken({ id: admin.id, role: admin.role });
      logger.info(`${logTag} JWT generated successfully for: ${email}`);
      console.log(`${logTag} JWT generated: ${token ? 'YES' : 'NO'} | JWT_SECRET set: ${!!process.env.JWT_SECRET}`);
    } catch (jwtErr) {
      logger.error(`${logTag} JWT generation FAILED: ${jwtErr.message}`);
      console.error(`${logTag} JWT ERROR:`, jwtErr.message);
      return sendError(res, 500, 'Token generation error');
    }

    // ── Step 6: Set cookie ────────────────────────────────────────
    // SameSite=None + Secure=true is required for cross-origin Vercel ↔ Render
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure:   isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info(`${logTag} Login SUCCESS: ${email} | role: ${admin.role}`);

    return sendSuccess(res, 200, 'Login successful', {
      admin: {
        id:        updated.id,
        name:      updated.name,
        email:     updated.email,
        role:      updated.role,
        lastLogin: updated.last_login,
      },
      token,
    });
  } catch (err) {
    logger.error(`${logTag} Unhandled error: ${err.message}`);
    console.error(`${logTag} UNHANDLED:`, err.message, err.stack);
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
      return sendError(res, 401, 'Current password is incorrect');
    }

    if (!newPassword || newPassword.length < 8) {
      return sendError(res, 400, 'New password must be at least 8 characters');
    }

    await Admin.updatePassword(admin.id, newPassword);

    return sendSuccess(res, 200, 'Password changed successfully');
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    next(err);
  }
};

// ── @route   POST /api/auth/logout
// ── @access  Private
const logout = (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  return sendSuccess(res, 200, 'Logged out successfully');
};

// ── @route   GET /api/auth/debug-connection
// ── @access  Public (PRODUCTION: returns 403 — only for non-prod debugging)
// ── PURPOSE: Verify DB connection and admin record presence WITHOUT exposing credentials
const debugConnection = async (req, res) => {
  // Hard block in production — remove this endpoint from routes once issue is resolved
  if (process.env.NODE_ENV === 'production') {
    return res.status(200).json({
      success: true,
      message: 'Debug endpoint active (production)',
      checks: {
        nodeEnv:      process.env.NODE_ENV,
        jwtSecretSet: !!process.env.JWT_SECRET,
        clientUrl:    process.env.CLIENT_URL || '(not set)',
        dbUrlSet:     !!process.env.DATABASE_URL,
        dbUrlPrefix:  process.env.DATABASE_URL
          ? process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@').substring(0, 80)
          : '(not set)',
      },
    });
  }

  const { pool } = require('../config/db');
  try {
    const { rows: tableCheck } = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='admins'`
    );
    const { rows: countRows } = await pool.query(`SELECT COUNT(*) AS cnt FROM admins`);
    const email = req.query.email;
    let adminRow = null;
    if (email) {
      const { rows } = await pool.query(
        `SELECT id, email, role, is_active, LEFT(password,10) AS hash_prefix FROM admins WHERE email = $1`,
        [email.toLowerCase().trim()]
      );
      adminRow = rows[0] || null;
    }
    return res.json({
      success:       true,
      dbConnected:   true,
      adminsTableExists: tableCheck.length > 0,
      adminCount:    parseInt(countRows[0].cnt, 10),
      adminRecord:   adminRow,
    });
  } catch (err) {
    return res.status(500).json({ success: false, dbConnected: false, error: err.message });
  }
};

module.exports = { register, login, getMe, changePassword, logout, debugConnection };
