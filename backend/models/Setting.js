// models/Setting.js — Application settings queries (PostgreSQL)
// Key-value store with group_name support for categorised settings.

const { pool } = require('../config/db');

// ── Get all settings ──────────────────────────────────────────
const getAll = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM settings ORDER BY group_name ASC, key ASC`
  );
  return rows;
};

// ── Get settings by group_name ────────────────────────────────
const getByGroup = async (group) => {
  const { rows } = await pool.query(
    `SELECT * FROM settings WHERE group_name = $1 ORDER BY key ASC`,
    [group]
  );
  return rows;
};

// ── Get a single setting by key ───────────────────────────────
const get = async (key) => {
  const { rows } = await pool.query(
    `SELECT * FROM settings WHERE key = $1 LIMIT 1`,
    [key]
  );
  return rows[0] || null;
};

// ── Upsert a single setting ───────────────────────────────────
const set = async (key, value) => {
  const { rows } = await pool.query(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, updated_at = NOW()
     RETURNING *`,
    [key, String(value)]
  );
  return rows[0];
};

// ── Bulk upsert settings ──────────────────────────────────────
// updates: array of { key, value }
const setBulk = async (updates) => {
  if (!updates || updates.length === 0) return [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    for (const { key, value } of updates) {
      const { rows } = await client.query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE
           SET value = EXCLUDED.value, updated_at = NOW()
         RETURNING *`,
        [key, String(value)]
      );
      results.push(rows[0]);
    }
    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { getAll, getByGroup, get, set, setBulk };
