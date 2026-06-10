// models/ActivityLog.js — Activity log queries (PostgreSQL)
// Records every admin action for audit purposes.

const { pool } = require('../config/db');

// ── Insert an activity log entry ──────────────────────────────
const insert = async ({
  adminId, adminName, action, entityType,
  entityId, entityLabel, details, ipAddress,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO activity_logs
       (admin_id, admin_name, action, entity_type, entity_id,
        entity_label, details, ip_address)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      adminId    || null,
      adminName  || null,
      action,
      entityType || null,
      entityId   || null,
      entityLabel|| null,
      details    ? JSON.stringify(details) : null,
      ipAddress  || null,
    ]
  );
  return rows[0];
};

// ── Build WHERE clause for log queries ───────────────────────
const buildWhere = (filter) => {
  const clauses = [];
  const values  = [];
  let   idx     = 1;

  if (filter.action)  { clauses.push(`action = $${idx++}`);     values.push(filter.action); }
  if (filter.adminId) { clauses.push(`admin_id = $${idx++}`);   values.push(filter.adminId); }
  if (filter.from)    { clauses.push(`created_at >= $${idx++}`); values.push(filter.from); }
  if (filter.to)      { clauses.push(`created_at <= $${idx++}`); values.push(filter.to); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, values };
};

// ── List activity logs with pagination and filters ────────────
const findAll = async ({ page = 1, limit = 50, action, adminId, from, to } = {}) => {
  const filter = {};
  if (action)  filter.action  = action;
  if (adminId) filter.adminId = adminId;
  if (from)    filter.from    = from;
  if (to)      filter.to      = to;

  const { where, values } = buildWhere(filter);
  const skip      = (parseInt(page) - 1) * parseInt(limit);
  const offsetIdx = values.length + 1;
  const limitIdx  = values.length + 2;

  const { rows } = await pool.query(
    `SELECT * FROM activity_logs ${where}
     ORDER BY created_at DESC
     OFFSET $${offsetIdx} LIMIT $${limitIdx}`,
    [...values, skip, parseInt(limit)]
  );
  return rows;
};

// ── Count total log entries (with optional filters) ───────────
const countTotal = async (filter = {}) => {
  const { where, values } = buildWhere(filter);
  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM activity_logs ${where}`,
    values
  );
  return parseInt(rows[0].count);
};

module.exports = { insert, findAll, countTotal };
