// models/Certificate.js — Certificate queries (PostgreSQL)
// All Mongoose logic removed. Flat table mapping directly to schema.sql.

const { pool } = require('../config/db');

// ── Build WHERE clause ────────────────────────────────────────
const buildWhere = (filter) => {
  const clauses = [];
  const values  = [];
  let   idx     = 1;

  if (filter.isActive !== undefined) { clauses.push(`is_active = $${idx++}`); values.push(filter.isActive); }
  if (filter.type)                   { clauses.push(`type = $${idx++}`);       values.push(filter.type); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, values };
};

// ── Count documents ───────────────────────────────────────────
const countDocuments = async (filter = {}) => {
  const { where, values } = buildWhere(filter);
  const { rows } = await pool.query(`SELECT COUNT(*) FROM certificates ${where}`, values);
  return parseInt(rows[0].count);
};

// ── List certificates ─────────────────────────────────────────
const find = async (filter = {}, { sort = 'sort_order ASC, created_at DESC' } = {}) => {
  const { where, values } = buildWhere(filter);
  const { rows } = await pool.query(
    `SELECT * FROM certificates ${where} ORDER BY ${sort}`,
    values
  );
  return rows;
};

// ── Find by ID ────────────────────────────────────────────────
const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM certificates WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// ── Create certificate ────────────────────────────────────────
const create = async (data) => {
  const { rows } = await pool.query(
    `INSERT INTO certificates
       (title, description, issuer, file_url, file_type, thumbnail_url,
        type, valid_from, valid_until, is_expired, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      data.title,
      data.description  || null,
      data.issuer       || null,
      data.fileUrl      || data.file_url,
      data.fileType     || data.file_type,
      data.thumbnailUrl || data.thumbnail_url || null,
      data.type,
      data.validFrom    || data.valid_from    || null,
      data.validUntil   || data.valid_until   || null,
      data.isExpired    ?? data.is_expired    ?? false,
      data.sortOrder    ?? data.sort_order    ?? 0,
      data.isActive     ?? data.is_active     ?? true,
    ]
  );
  return rows[0];
};

// ── Update certificate ────────────────────────────────────────
const findByIdAndUpdate = async (id, data) => {
  const { rows } = await pool.query(
    `UPDATE certificates SET
       title         = COALESCE($1, title),
       description   = COALESCE($2, description),
       issuer        = COALESCE($3, issuer),
       file_url      = COALESCE($4, file_url),
       file_type     = COALESCE($5, file_type),
       thumbnail_url = COALESCE($6, thumbnail_url),
       type          = COALESCE($7, type),
       valid_from    = COALESCE($8, valid_from),
       valid_until   = COALESCE($9, valid_until),
       is_expired    = COALESCE($10, is_expired),
       sort_order    = COALESCE($11, sort_order),
       is_active     = COALESCE($12, is_active),
       updated_at    = NOW()
     WHERE id = $13
     RETURNING *`,
    [
      data.title         || null,
      data.description   || null,
      data.issuer        || null,
      data.fileUrl       || data.file_url       || null,
      data.fileType      || data.file_type      || null,
      data.thumbnailUrl  || data.thumbnail_url  || null,
      data.type          || null,
      data.validFrom     || data.valid_from     || null,
      data.validUntil    || data.valid_until    || null,
      data.isExpired     ?? data.is_expired     ?? null,
      data.sortOrder     ?? data.sort_order     ?? null,
      data.isActive      ?? data.is_active      ?? null,
      id,
    ]
  );
  return rows[0] || null;
};

// ── Delete certificate ────────────────────────────────────────
const findByIdAndDelete = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM certificates WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
};

module.exports = {
  countDocuments,
  find,
  findById,
  create,
  findByIdAndUpdate,
  findByIdAndDelete,
};
