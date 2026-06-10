// models/Cms.js — CMS content queries (PostgreSQL)
// Manages testimonials, FAQs, and site statistics.

const { pool } = require('../config/db');

// ════════════════════════════════════════════════════════════
//  TESTIMONIALS
// ════════════════════════════════════════════════════════════

// ── Get all testimonials (optionally active only) ─────────────
const getTestimonials = async (activeOnly = false) => {
  const where = activeOnly ? `WHERE is_active = TRUE` : '';
  const { rows } = await pool.query(
    `SELECT * FROM cms_testimonials ${where} ORDER BY sort_order ASC, created_at ASC`
  );
  return rows;
};

// ── Create testimonial ────────────────────────────────────────
const createTestimonial = async (data) => {
  // Default sort_order to max + 1
  const { rows: maxRows } = await pool.query(
    `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM cms_testimonials`
  );
  const sortOrder = data.sortOrder !== undefined ? data.sortOrder : maxRows[0].next_order;

  const { rows } = await pool.query(
    `INSERT INTO cms_testimonials
       (author_name, author_title, company, country, quote, rating,
        avatar_url, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      data.authorName,
      data.authorTitle  || null,
      data.company      || null,
      data.country      || null,
      data.quote,
      data.rating       || 5,
      data.avatarUrl    || null,
      sortOrder,
      data.isActive     !== undefined ? data.isActive : true,
    ]
  );
  return rows[0];
};

// ── Update testimonial ────────────────────────────────────────
const updateTestimonial = async (id, data) => {
  const fields = [];
  const values = [];
  let   idx    = 1;

  if (data.authorName  !== undefined) { fields.push(`author_name = $${idx++}`);  values.push(data.authorName); }
  if (data.authorTitle !== undefined) { fields.push(`author_title = $${idx++}`); values.push(data.authorTitle); }
  if (data.company     !== undefined) { fields.push(`company = $${idx++}`);      values.push(data.company); }
  if (data.country     !== undefined) { fields.push(`country = $${idx++}`);      values.push(data.country); }
  if (data.quote       !== undefined) { fields.push(`quote = $${idx++}`);        values.push(data.quote); }
  if (data.rating      !== undefined) { fields.push(`rating = $${idx++}`);       values.push(data.rating); }
  if (data.avatarUrl   !== undefined) { fields.push(`avatar_url = $${idx++}`);   values.push(data.avatarUrl); }
  if (data.sortOrder   !== undefined) { fields.push(`sort_order = $${idx++}`);   values.push(data.sortOrder); }
  if (data.isActive    !== undefined) { fields.push(`is_active = $${idx++}`);    values.push(data.isActive); }

  if (fields.length === 0) {
    const { rows } = await pool.query(`SELECT * FROM cms_testimonials WHERE id = $1`, [id]);
    return rows[0] || null;
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE cms_testimonials SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
};

// ── Delete testimonial ────────────────────────────────────────
const deleteTestimonial = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM cms_testimonials WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
};

// ── Reorder testimonials ──────────────────────────────────────
// orderedIds: array of IDs in desired display order
const reorderTestimonials = async (orderedIds) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < orderedIds.length; i++) {
      await client.query(
        `UPDATE cms_testimonials SET sort_order = $1 WHERE id = $2`,
        [i, orderedIds[i]]
      );
    }
    await client.query('COMMIT');
    return getTestimonials();
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ════════════════════════════════════════════════════════════
//  FAQs
// ════════════════════════════════════════════════════════════

// ── Get all FAQs (optionally active only) ─────────────────────
const getFaqs = async (activeOnly = false) => {
  const where = activeOnly ? `WHERE is_active = TRUE` : '';
  const { rows } = await pool.query(
    `SELECT * FROM cms_faqs ${where} ORDER BY sort_order ASC, created_at ASC`
  );
  return rows;
};

// ── Create FAQ ────────────────────────────────────────────────
const createFaq = async (data) => {
  const { rows: maxRows } = await pool.query(
    `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM cms_faqs`
  );
  const sortOrder = data.sortOrder !== undefined ? data.sortOrder : maxRows[0].next_order;

  const { rows } = await pool.query(
    `INSERT INTO cms_faqs (question, answer, category, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [
      data.question,
      data.answer,
      data.category  || null,
      sortOrder,
      data.isActive !== undefined ? data.isActive : true,
    ]
  );
  return rows[0];
};

// ── Update FAQ ────────────────────────────────────────────────
const updateFaq = async (id, data) => {
  const fields = [];
  const values = [];
  let   idx    = 1;

  if (data.question  !== undefined) { fields.push(`question = $${idx++}`);   values.push(data.question); }
  if (data.answer    !== undefined) { fields.push(`answer = $${idx++}`);     values.push(data.answer); }
  if (data.category  !== undefined) { fields.push(`category = $${idx++}`);   values.push(data.category); }
  if (data.sortOrder !== undefined) { fields.push(`sort_order = $${idx++}`); values.push(data.sortOrder); }
  if (data.isActive  !== undefined) { fields.push(`is_active = $${idx++}`);  values.push(data.isActive); }

  if (fields.length === 0) {
    const { rows } = await pool.query(`SELECT * FROM cms_faqs WHERE id = $1`, [id]);
    return rows[0] || null;
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE cms_faqs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
};

// ── Delete FAQ ────────────────────────────────────────────────
const deleteFaq = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM cms_faqs WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
};

// ════════════════════════════════════════════════════════════
//  STATS
// ════════════════════════════════════════════════════════════

// ── Get all stats ─────────────────────────────────────────────
const getStats = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM cms_stats ORDER BY key ASC`
  );
  return rows;
};

// ── Upsert a single stat by key ───────────────────────────────
const updateStat = async (key, value) => {
  const { rows } = await pool.query(
    `INSERT INTO cms_stats (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, updated_at = NOW()
     RETURNING *`,
    [key, String(value)]
  );
  return rows[0];
};

module.exports = {
  // Testimonials
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  // FAQs
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  // Stats
  getStats,
  updateStat,
};
