// models/Admin.js — Admin user queries (PostgreSQL)
// All Mongoose logic removed. Uses pg pool with bcrypt for password handling.

const { pool } = require('../config/db');
const bcrypt   = require('bcryptjs');

// ── Find admin by email (returns row or null) ─────────────────
const findByEmail = async (email, includePassword = false) => {
  const fields = includePassword
    ? '*'
    : 'id, name, email, role, is_active, last_login, created_at, updated_at';
  const { rows } = await pool.query(
    `SELECT ${fields} FROM admins WHERE email = $1 LIMIT 1`,
    [email.toLowerCase().trim()]
  );
  return rows[0] || null;
};

// ── Find admin by ID ──────────────────────────────────────────
const findById = async (id, includePassword = false) => {
  const fields = includePassword
    ? '*'
    : 'id, name, email, role, is_active, last_login, created_at, updated_at';
  const { rows } = await pool.query(
    `SELECT ${fields} FROM admins WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// ── Create new admin ──────────────────────────────────────────
const create = async ({ name, email, password, role = 'admin' }) => {
  const salt   = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(password, salt);

  const { rows } = await pool.query(
    `INSERT INTO admins (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, is_active, last_login, created_at, updated_at`,
    [name.trim(), email.toLowerCase().trim(), hashed, role]
  );
  return rows[0];
};

// ── Update last login timestamp ───────────────────────────────
const updateLastLogin = async (id) => {
  const { rows } = await pool.query(
    `UPDATE admins SET last_login = NOW(), updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, role, is_active, last_login`,
    [id]
  );
  return rows[0];
};

// ── Update password (hashes before saving) ────────────────────
const updatePassword = async (id, newPassword) => {
  const salt   = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(newPassword, salt);
  await pool.query(
    `UPDATE admins SET password = $1, updated_at = NOW() WHERE id = $2`,
    [hashed, id]
  );
};

// ── Compare plain-text password with stored hash ──────────────
const comparePassword = async (plainText, hash) => {
  return bcrypt.compare(plainText, hash);
};

module.exports = { findByEmail, findById, create, updateLastLogin, updatePassword, comparePassword };
