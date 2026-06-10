// models/Buyer.js — Buyer queries (PostgreSQL)
// Manages buyer records with search, pagination, and related data lookups.

const { pool } = require('../config/db');

// ── Build WHERE clause from filter ───────────────────────────
const buildWhere = (filter) => {
  const clauses = [];
  const values  = [];
  let   idx     = 1;

  if (filter.country) {
    clauses.push(`country ILIKE $${idx++}`);
    values.push(`%${filter.country}%`);
  }
  if (filter.search) {
    clauses.push(
      `(name ILIKE $${idx} OR email ILIKE $${idx} OR company ILIKE $${idx})`
    );
    values.push(`%${filter.search}%`);
    idx++;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, values };
};

// ── Count buyers matching filter ──────────────────────────────
const countDocuments = async (filter = {}) => {
  const { where, values } = buildWhere(filter);
  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM buyers ${where}`,
    values
  );
  return parseInt(rows[0].count);
};

// ── List buyers with search, country filter, pagination ───────
const findAll = async ({ search, country, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (search)  filter.search  = search;
  if (country) filter.country = country;

  const { where, values } = buildWhere(filter);
  const skip       = (parseInt(page) - 1) * parseInt(limit);
  const offsetIdx  = values.length + 1;
  const limitIdx   = values.length + 2;

  const { rows } = await pool.query(
    `SELECT * FROM buyers ${where} ORDER BY created_at DESC OFFSET $${offsetIdx} LIMIT $${limitIdx}`,
    [...values, skip, parseInt(limit)]
  );
  return rows;
};

// ── Find single buyer by ID ───────────────────────────────────
const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM buyers WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// ── Create buyer ──────────────────────────────────────────────
const create = async (data) => {
  const { rows } = await pool.query(
    `INSERT INTO buyers (name, company, email, phone, country, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.name,
      data.company  || null,
      data.email,
      data.phone    || null,
      data.country  || null,
      data.notes    || null,
    ]
  );
  return rows[0];
};

// ── Update buyer ──────────────────────────────────────────────
const update = async (id, data) => {
  const fields  = [];
  const values  = [];
  let   idx     = 1;

  if (data.name    !== undefined) { fields.push(`name = $${idx++}`);    values.push(data.name); }
  if (data.company !== undefined) { fields.push(`company = $${idx++}`); values.push(data.company); }
  if (data.email   !== undefined) { fields.push(`email = $${idx++}`);   values.push(data.email); }
  if (data.phone   !== undefined) { fields.push(`phone = $${idx++}`);   values.push(data.phone); }
  if (data.country !== undefined) { fields.push(`country = $${idx++}`); values.push(data.country); }
  if (data.notes   !== undefined) { fields.push(`notes = $${idx++}`);   values.push(data.notes); }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE buyers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
};

// ── Delete buyer ──────────────────────────────────────────────
const remove = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM buyers WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
};

// ── Get all inquiries for a buyer by email ────────────────────
const findInquiries = async (buyerEmail) => {
  const { rows } = await pool.query(
    `SELECT id, name, company, email, phone, country, product, quantity,
            subject, message, status, admin_notes, created_at, updated_at
     FROM inquiries
     WHERE email = $1
     ORDER BY created_at DESC`,
    [buyerEmail]
  );
  return rows;
};

// ── Get all quotations for a buyer by buyer_id ────────────────
const findQuotations = async (buyerId) => {
  const { rows } = await pool.query(
    `SELECT id, quote_number, buyer_name, buyer_email, buyer_company,
            buyer_country, status, total_amount, currency, valid_until,
            notes, created_at, updated_at
     FROM quotations
     WHERE buyer_id = $1
     ORDER BY created_at DESC`,
    [buyerId]
  );
  return rows;
};

module.exports = {
  countDocuments,
  findAll,
  findById,
  create,
  update,
  remove,
  findInquiries,
  findQuotations,
};
