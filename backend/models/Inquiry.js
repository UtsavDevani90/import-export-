// models/Inquiry.js — Inquiry queries (PostgreSQL)
// All Mongoose logic removed. Flat table — no child arrays.

const { pool } = require('../config/db');

// ── Build WHERE clause from filter ───────────────────────────
const buildWhere = (filter) => {
  const clauses = [];
  const values  = [];
  let   idx     = 1;

  if (filter.status)  { clauses.push(`status = $${idx++}`);  values.push(filter.status); }
  if (filter.country) {
    clauses.push(`country ILIKE $${idx++}`);
    values.push(`%${filter.country}%`);
  }
  if (filter.search) {
    clauses.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR company ILIKE $${idx} OR product ILIKE $${idx})`);
    values.push(`%${filter.search}%`);
    idx++;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, values };
};

// ── Count documents ───────────────────────────────────────────
const countDocuments = async (filter = {}) => {
  const { where, values } = buildWhere(filter);
  const { rows } = await pool.query(`SELECT COUNT(*) FROM inquiries ${where}`, values);
  return parseInt(rows[0].count);
};

// ── List inquiries with pagination ────────────────────────────
const find = async (filter = {}, { sort = 'created_at DESC', skip = 0, limit = 20, select } = {}) => {
  const { where, values } = buildWhere(filter);
  const offsetIdx = values.length + 1;
  const limitIdx  = values.length + 2;

  const columns = select || '*';
  const { rows } = await pool.query(
    `SELECT ${columns} FROM inquiries ${where} ORDER BY ${sort} OFFSET $${offsetIdx} LIMIT $${limitIdx}`,
    [...values, skip, limit]
  );
  return rows;
};

// ── Find single inquiry by ID ─────────────────────────────────
const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM inquiries WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// ── Create inquiry ────────────────────────────────────────────
const create = async (data) => {
  const { rows } = await pool.query(
    `INSERT INTO inquiries
       (name, company, email, phone, country,
        product, quantity, subject, message,
        ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      data.name, data.company || null, data.email,
      data.phone || null, data.country,
      data.product || null, data.quantity || null,
      data.subject || null, data.message || null,
      data.ipAddress || data.ip_address || null,
      data.userAgent || data.user_agent || null,
    ]
  );
  return rows[0];
};

// ── Mark inquiry as read ──────────────────────────────────────
const markAsRead = async (id) => {
  const { rows } = await pool.query(
    `UPDATE inquiries SET status = 'read', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
};

// ── Update status & notes ─────────────────────────────────────
const updateStatus = async (id, { status, adminNotes }) => {
  const { rows } = await pool.query(
    `UPDATE inquiries
     SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, adminNotes || null, id]
  );
  return rows[0] || null;
};

// ── Delete inquiry ────────────────────────────────────────────
const findByIdAndDelete = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM inquiries WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
};

// ── Aggregate inquiry counts by status ───────────────────────
const aggregateByStatus = async () => {
  const { rows } = await pool.query(
    `SELECT status, COUNT(*) AS count FROM inquiries GROUP BY status`
  );
  return rows; // [{ status: 'new', count: '5' }, ...]
};

module.exports = {
  countDocuments,
  find,
  findById,
  create,
  markAsRead,
  updateStatus,
  findByIdAndDelete,
  aggregateByStatus,
};
