// models/User.js — Portal user queries (PostgreSQL)
// Handles buyer/user accounts in the `users` table.
// Completely separate from the `admins` table.

const { pool } = require('../config/db');
const bcrypt   = require('bcryptjs');

// ── Find user by email ────────────────────────────────────────
const findByEmail = async (email, includePassword = false) => {
  const fields = includePassword
    ? '*'
    : 'id, full_name, email, phone, company_name, country, role, is_active, email_verified, last_login, google_id, avatar, created_at, updated_at';
  const { rows } = await pool.query(
    `SELECT ${fields} FROM users WHERE email = $1 LIMIT 1`,
    [email.toLowerCase().trim()]
  );
  return rows[0] || null;
};

// ── Find user by ID ───────────────────────────────────────────
const findById = async (id, includePassword = false) => {
  const fields = includePassword
    ? '*'
    : 'id, full_name, email, phone, company_name, country, role, is_active, email_verified, last_login, google_id, avatar, created_at, updated_at';
  const { rows } = await pool.query(
    `SELECT ${fields} FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// ── Find user by Google ID ─────────────────────────────────────────
const findByGoogleId = async (googleId) => {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, phone, company_name, country, role, is_active,
            email_verified, last_login, google_id, avatar, created_at, updated_at
     FROM users WHERE google_id = $1 LIMIT 1`,
    [googleId]
  );
  return rows[0] || null;
};

// ── Create a Google-authenticated user (no password) ──────────────
const createGoogleUser = async ({ full_name, email, google_id, avatar }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, google_id, avatar, email_verified)
     VALUES ($1, $2, NULL, $3, $4, TRUE)
     RETURNING id, full_name, email, phone, company_name, country, role, is_active,
               email_verified, last_login, google_id, avatar, created_at, updated_at`,
    [
      full_name.trim(),
      email.toLowerCase().trim(),
      google_id,
      avatar || null,
    ]
  );
  return rows[0];
};

// ── Link a Google ID to an existing email/password account ────────
const linkGoogleId = async (id, googleId, avatar) => {
  const { rows } = await pool.query(
    `UPDATE users
     SET google_id      = $1,
         avatar         = COALESCE($2, avatar),
         email_verified = TRUE,
         updated_at     = NOW()
     WHERE id = $3
     RETURNING id, full_name, email, phone, company_name, country, role, is_active,
               email_verified, last_login, google_id, avatar, created_at, updated_at`,
    [googleId, avatar || null, id]
  );
  return rows[0] || null;
};

// ── Create new user ───────────────────────────────────────────
const create = async ({ full_name, email, password, phone, company_name, country }) => {
  const salt   = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(password, salt);

  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, phone, company_name, country)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, email, phone, company_name, country, role, is_active, email_verified, last_login, created_at, updated_at`,
    [
      full_name.trim(),
      email.toLowerCase().trim(),
      hashed,
      phone || null,
      company_name || null,
      country || null,
    ]
  );
  return rows[0];
};

// ── Update last login ─────────────────────────────────────────
const updateLastLogin = async (id) => {
  const { rows } = await pool.query(
    `UPDATE users SET last_login = NOW(), updated_at = NOW()
     WHERE id = $1
     RETURNING id, full_name, email, phone, company_name, country, role, is_active, last_login`,
    [id]
  );
  return rows[0];
};

// ── Update profile fields ─────────────────────────────────────
const updateProfile = async (id, { full_name, phone, company_name, country }) => {
  const { rows } = await pool.query(
    `UPDATE users
     SET full_name    = COALESCE($1, full_name),
         phone        = COALESCE($2, phone),
         company_name = COALESCE($3, company_name),
         country      = COALESCE($4, country),
         updated_at   = NOW()
     WHERE id = $5
     RETURNING id, full_name, email, phone, company_name, country, role, is_active, last_login, updated_at`,
    [full_name || null, phone || null, company_name || null, country || null, id]
  );
  return rows[0] || null;
};

// ── Update password ───────────────────────────────────────────
const updatePassword = async (id, newPassword) => {
  const salt   = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(newPassword, salt);
  await pool.query(
    `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
    [hashed, id]
  );
};

// ── Compare password ──────────────────────────────────────────
const comparePassword = async (plainText, hash) => {
  return bcrypt.compare(plainText, hash);
};

// ── Find all users (admin use) ────────────────────────────────
const findAll = async ({ page = 1, limit = 20, search, country, isActive } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let idx = 1;

  if (search) {
    conditions.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx} OR company_name ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }
  if (country) {
    conditions.push(`country = $${idx}`);
    params.push(country);
    idx++;
  }
  if (isActive !== undefined) {
    conditions.push(`is_active = $${idx}`);
    params.push(isActive);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) AS total FROM users ${where}`, params
  );
  const total = parseInt(countRows[0].total, 10);

  const { rows } = await pool.query(
    `SELECT id, full_name, email, phone, company_name, country, role, is_active, email_verified, last_login, created_at
     FROM users ${where}
     ORDER BY created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );

  return { users: rows, total, page, limit, pages: Math.ceil(total / limit) };
};

// ── Update active status ──────────────────────────────────────
const updateStatus = async (id, isActive) => {
  const { rows } = await pool.query(
    `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2
     RETURNING id, full_name, email, role, is_active, updated_at`,
    [isActive, id]
  );
  return rows[0] || null;
};

// ── Remove user ───────────────────────────────────────────────
const remove = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING id, full_name, email`,
    [id]
  );
  return rows[0] || null;
};

// ── Store hashed reset token + expiry ─────────────────────────
// rawToken is never stored — only its SHA-256 hex hash.
const setResetToken = async (email, tokenHash, expiresAt) => {
  const { rows } = await pool.query(
    `UPDATE users
     SET reset_password_token   = $1,
         reset_password_expires = $2,
         updated_at             = NOW()
     WHERE email = $3
     RETURNING id`,
    [tokenHash, expiresAt, email.toLowerCase().trim()]
  );
  return rows[0] || null;
};

// ── Find user by valid (unexpired) reset token hash ───────────
const findByResetToken = async (tokenHash) => {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, is_active
     FROM users
     WHERE reset_password_token   = $1
       AND reset_password_expires > NOW()
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
};

// ── Clear reset token after successful password reset ─────────
const clearResetToken = async (id) => {
  await pool.query(
    `UPDATE users
     SET reset_password_token   = NULL,
         reset_password_expires = NULL,
         updated_at             = NOW()
     WHERE id = $1`,
    [id]
  );
};

// ── Favorites ─────────────────────────────────────────────────
const getFavorites = async (userId) => {
  const { rows } = await pool.query(
    `SELECT p.id, p.title, p.slug, p.short_description, p.category,
            p.featured_image, p.status, uf.created_at AS saved_at
     FROM user_favorites uf
     JOIN products p ON p.id = uf.product_id
     WHERE uf.user_id = $1
     ORDER BY uf.created_at DESC`,
    [userId]
  );
  return rows;
};

const addFavorite = async (userId, productId) => {
  const { rows } = await pool.query(
    `INSERT INTO user_favorites (user_id, product_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, product_id) DO NOTHING
     RETURNING id, user_id, product_id, created_at`,
    [userId, productId]
  );
  return rows[0] || null;
};

const removeFavorite = async (userId, productId) => {
  const { rows } = await pool.query(
    `DELETE FROM user_favorites WHERE user_id = $1 AND product_id = $2
     RETURNING id`,
    [userId, productId]
  );
  return rows[0] || null;
};

const isFavorite = async (userId, productId) => {
  const { rows } = await pool.query(
    `SELECT 1 FROM user_favorites WHERE user_id = $1 AND product_id = $2 LIMIT 1`,
    [userId, productId]
  );
  return rows.length > 0;
};

// ── Notifications ─────────────────────────────────────────────
const getNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const offset = (page - 1) * limit;
  const where = unreadOnly ? 'AND is_read = FALSE' : '';
  const { rows } = await pool.query(
    `SELECT id, title, message, type, is_read, link, created_at
     FROM user_notifications
     WHERE user_id = $1 ${where}
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_read = FALSE) AS unread
     FROM user_notifications WHERE user_id = $1`,
    [userId]
  );
  return { notifications: rows, total: parseInt(countRows[0].total), unread: parseInt(countRows[0].unread) };
};

const markNotificationRead = async (id, userId) => {
  const { rows } = await pool.query(
    `UPDATE user_notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return rows[0] || null;
};

const markAllNotificationsRead = async (userId) => {
  await pool.query(
    `UPDATE user_notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
};

const createNotification = async ({ user_id, title, message, type = 'info', link }) => {
  const { rows } = await pool.query(
    `INSERT INTO user_notifications (user_id, title, message, type, link)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, title, message, type, is_read, link, created_at`,
    [user_id, title, message, type, link || null]
  );
  return rows[0];
};

module.exports = {
  findByEmail,
  findById,
  findByGoogleId,
  create,
  createGoogleUser,
  linkGoogleId,
  updateLastLogin,
  updateProfile,
  updatePassword,
  comparePassword,
  findAll,
  updateStatus,
  remove,
  // Password reset
  setResetToken,
  findByResetToken,
  clearResetToken,
  // Favorites
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  // Notifications
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
};
