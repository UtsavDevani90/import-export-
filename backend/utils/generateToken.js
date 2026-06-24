// utils/generateToken.js — JWT access + refresh token generator
// Access tokens: short-lived (15 min), signed with JWT_SECRET
// Refresh tokens: long-lived (7 days), signed with JWT_REFRESH_SECRET
// Both are stored as httpOnly cookies; refresh token hash is persisted in DB.

const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');
const logger = require('./logger');

// ── Token durations ───────────────────────────────────────────
const ACCESS_EXPIRE  = process.env.JWT_EXPIRE         || '15m';
const REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';
const REFRESH_MS     = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// ── Generate a signed access token (short-lived) ──────────────
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRE });
};

// ── Generate a signed refresh token (long-lived) ──────────────
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRE });
};

// ── Hash a refresh token for storage (never store raw token) ──
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// ── Store refresh token in DB ─────────────────────────────────
const storeRefreshToken = async ({ rawToken, adminId, userId, accountType, ip, userAgent }) => {
  try {
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + REFRESH_MS);

    await pool.query(
      `INSERT INTO refresh_tokens (token_hash, admin_id, user_id, account_type, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (token_hash) DO NOTHING`,
      [tokenHash, adminId || null, userId || null, accountType, expiresAt, ip || null, userAgent || null]
    );
  } catch (err) {
    logger.error(`[TOKEN] Failed to store refresh token: ${err.message}`);
    // Non-fatal — login still works
  }
};

// ── Validate and consume a refresh token from DB ──────────────
const consumeRefreshToken = async (rawToken) => {
  const tokenHash = hashToken(rawToken);

  const { rows } = await pool.query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = $1
       AND revoked_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  if (!rows[0]) return null;

  // Rotate: revoke the consumed token immediately (one-time use)
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1`,
    [rows[0].id]
  );

  return rows[0];
};

// ── Revoke ALL refresh tokens for an account (logout) ─────────
const revokeAllRefreshTokens = async ({ adminId, userId }) => {
  try {
    if (adminId) {
      await pool.query(
        `UPDATE refresh_tokens SET revoked_at = NOW()
         WHERE admin_id = $1 AND revoked_at IS NULL`,
        [adminId]
      );
    } else if (userId) {
      await pool.query(
        `UPDATE refresh_tokens SET revoked_at = NOW()
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId]
      );
    }
  } catch (err) {
    logger.error(`[TOKEN] Failed to revoke refresh tokens: ${err.message}`);
  }
};

// ── Backward-compatible alias (used by existing callers) ───────
// Returns an access token. Callers that need refresh token should
// use generateAccessToken + generateRefreshToken explicitly.
const generateToken = (payload) => generateAccessToken(payload);

module.exports = {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  consumeRefreshToken,
  revokeAllRefreshTokens,
  hashToken,
};
