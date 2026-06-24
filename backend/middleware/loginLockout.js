// middleware/loginLockout.js — Account lockout protection
// Tracks failed login attempts per account in the DB.
// After MAX_ATTEMPTS failures → locks the account for LOCKOUT_MINUTES.
// Compatible with both admins and users tables.

const { pool }  = require('../config/db');
const { sendError } = require('../utils/apiResponse');
const logger    = require('../utils/logger');

const MAX_ATTEMPTS      = 5;
const LOCKOUT_MINUTES   = 15;

// ── Internal DB helpers ───────────────────────────────────────

const getAccountRow = async (table, email) => {
  const { rows } = await pool.query(
    `SELECT id, failed_attempts, lockout_until FROM ${table} WHERE email = $1 LIMIT 1`,
    [email.toLowerCase().trim()]
  );
  return rows[0] || null;
};

// ── Check if account is locked out ───────────────────────────
// Returns true if the account is currently locked.
const isLockedOut = async (table, email) => {
  const row = await getAccountRow(table, email);
  if (!row || !row.lockout_until) return false;
  return new Date(row.lockout_until) > new Date();
};

// ── Record a failed login attempt ─────────────────────────────
const recordFailedAttempt = async (table, email) => {
  try {
    // Increment attempt counter; lock if threshold reached
    await pool.query(
      `UPDATE ${table}
       SET failed_attempts = failed_attempts + 1,
           lockout_until   = CASE
             WHEN failed_attempts + 1 >= $1
             THEN NOW() + INTERVAL '${LOCKOUT_MINUTES} minutes'
             ELSE lockout_until
           END,
           updated_at = NOW()
       WHERE email = $2`,
      [MAX_ATTEMPTS, email.toLowerCase().trim()]
    );
  } catch (err) {
    logger.error(`[LOCKOUT] Failed to record attempt for ${email}: ${err.message}`);
  }
};

// ── Reset after successful login ──────────────────────────────
const resetFailedAttempts = async (table, email) => {
  try {
    await pool.query(
      `UPDATE ${table}
       SET failed_attempts = 0, lockout_until = NULL, updated_at = NOW()
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
  } catch (err) {
    logger.error(`[LOCKOUT] Failed to reset attempts for ${email}: ${err.message}`);
  }
};

// ── getRemainingLockout — returns minutes remaining ───────────
const getRemainingLockoutMinutes = async (table, email) => {
  const row = await getAccountRow(table, email);
  if (!row?.lockout_until) return 0;
  const remaining = Math.ceil((new Date(row.lockout_until) - new Date()) / 60000);
  return Math.max(0, remaining);
};

// ── Middleware factory ─────────────────────────────────────────
// Usage: router.post('/login', checkLockout('admins'), loginHandler)
//        router.post('/login', checkLockout('users'),  loginHandler)
const checkLockout = (table) => async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(); // Validation middleware will catch missing email

  try {
    const locked = await isLockedOut(table, email);
    if (locked) {
      const mins = await getRemainingLockoutMinutes(table, email);
      logger.warn(`[LOCKOUT] Account locked: ${email} | remaining: ${mins}min | IP: ${req.ip}`);
      return sendError(
        res, 429,
        `Account temporarily locked due to too many failed attempts. Try again in ${mins} minute(s).`
      );
    }
    next();
  } catch (err) {
    logger.error(`[LOCKOUT] checkLockout error: ${err.message}`);
    next(); // Don't block login if lockout check fails
  }
};

module.exports = {
  checkLockout,
  recordFailedAttempt,
  resetFailedAttempts,
  isLockedOut,
};
