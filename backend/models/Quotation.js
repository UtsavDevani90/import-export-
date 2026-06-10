// models/Quotation.js — Quotation queries (PostgreSQL)
// Manages quotation headers and line items with transactional writes.

const { pool } = require('../config/db');

// ── Generate next sequential quote number ─────────────────────
// Format: TZQ-YYYY-NNN (e.g. TZQ-2026-001)
const generateQuoteNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `TZQ-${year}-`;

  const { rows } = await pool.query(
    `SELECT quote_number FROM quotations
     WHERE quote_number LIKE $1
     ORDER BY quote_number DESC
     LIMIT 1`,
    [`${prefix}%`]
  );

  let nextNum = 1;
  if (rows.length > 0) {
    const last = rows[0].quote_number; // e.g. TZQ-2026-007
    const parts = last.split('-');
    nextNum = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${String(nextNum).padStart(3, '0')}`;
};

// ── Build WHERE clause from filter ───────────────────────────
const buildWhere = (filter) => {
  const clauses = [];
  const values  = [];
  let   idx     = 1;

  if (filter.status)  { clauses.push(`status = $${idx++}`);    values.push(filter.status); }
  if (filter.buyerId) { clauses.push(`buyer_id = $${idx++}`);  values.push(filter.buyerId); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, values };
};

// ── Count quotations matching filter ──────────────────────────
const countDocuments = async (filter = {}) => {
  const { where, values } = buildWhere(filter);
  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM quotations ${where}`,
    values
  );
  return parseInt(rows[0].count);
};

// ── List quotations with pagination ───────────────────────────
const findAll = async ({ status, buyerId, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (status)  filter.status  = status;
  if (buyerId) filter.buyerId = buyerId;

  const { where, values } = buildWhere(filter);
  const skip      = (parseInt(page) - 1) * parseInt(limit);
  const offsetIdx = values.length + 1;
  const limitIdx  = values.length + 2;

  const { rows } = await pool.query(
    `SELECT id, quote_number, buyer_id, buyer_name, buyer_email, buyer_company,
            buyer_country, status, total_amount, currency, valid_until,
            notes, created_by, created_at, updated_at
     FROM quotations ${where}
     ORDER BY created_at DESC
     OFFSET $${offsetIdx} LIMIT $${limitIdx}`,
    [...values, skip, parseInt(limit)]
  );
  return rows;
};

// ── Find single quotation by ID (includes items) ──────────────
const findById = async (id) => {
  const { rows: quotRows } = await pool.query(
    `SELECT * FROM quotations WHERE id = $1 LIMIT 1`,
    [id]
  );
  if (!quotRows[0]) return null;

  const quotation = quotRows[0];

  const { rows: items } = await pool.query(
    `SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY sort_order ASC`,
    [id]
  );

  quotation.items = items;
  return quotation;
};

// ── Create quotation with items (transactional) ───────────────
const create = async (data, items = []) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: quotRows } = await client.query(
      `INSERT INTO quotations
         (quote_number, buyer_id, buyer_name, buyer_email, buyer_company,
          buyer_country, status, notes, total_amount, currency, valid_until, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        data.quoteNumber,
        data.buyerId      || null,
        data.buyerName,
        data.buyerEmail,
        data.buyerCompany || null,
        data.buyerCountry || null,
        data.status       || 'draft',
        data.notes        || null,
        data.totalAmount  || 0,
        data.currency     || 'USD',
        data.validUntil   || null,
        data.createdBy    || null,
      ]
    );

    const quotation = quotRows[0];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await client.query(
        `INSERT INTO quotation_items
           (quotation_id, product_name, description, quantity, unit_price, total_price, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          quotation.id,
          item.productName,
          item.description || null,
          item.quantity,
          item.unitPrice,
          item.totalPrice || (item.quantity * item.unitPrice),
          item.sortOrder  !== undefined ? item.sortOrder : i,
        ]
      );
    }

    await client.query('COMMIT');

    quotation.items = items;
    return quotation;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ── Update quotation with items (transactional) ───────────────
// Replaces all items on update
const update = async (id, data, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const fields = [];
    const values = [];
    let   idx    = 1;

    const mappings = {
      buyerId:      'buyer_id',
      buyerName:    'buyer_name',
      buyerEmail:   'buyer_email',
      buyerCompany: 'buyer_company',
      buyerCountry: 'buyer_country',
      status:       'status',
      notes:        'notes',
      totalAmount:  'total_amount',
      currency:     'currency',
      validUntil:   'valid_until',
    };

    for (const [jsKey, dbCol] of Object.entries(mappings)) {
      if (data[jsKey] !== undefined) {
        fields.push(`${dbCol} = $${idx++}`);
        values.push(data[jsKey]);
      }
    }

    if (fields.length > 0) {
      fields.push(`updated_at = NOW()`);
      values.push(id);
      await client.query(
        `UPDATE quotations SET ${fields.join(', ')} WHERE id = $${idx}`,
        values
      );
    }

    // Replace items if provided
    if (Array.isArray(items)) {
      await client.query(
        `DELETE FROM quotation_items WHERE quotation_id = $1`,
        [id]
      );

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await client.query(
          `INSERT INTO quotation_items
             (quotation_id, product_name, description, quantity, unit_price, total_price, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            id,
            item.productName,
            item.description || null,
            item.quantity,
            item.unitPrice,
            item.totalPrice || (item.quantity * item.unitPrice),
            item.sortOrder  !== undefined ? item.sortOrder : i,
          ]
        );
      }
    }

    await client.query('COMMIT');
    return findById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ── Delete quotation (cascades to items via FK) ───────────────
const remove = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM quotations WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
};

module.exports = {
  generateQuoteNumber,
  countDocuments,
  findAll,
  findById,
  create,
  update,
  remove,
};
