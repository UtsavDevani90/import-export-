// models/Product.js — Product queries (PostgreSQL)
// All Mongoose logic removed. Arrays stored in child tables per schema.sql.

const { pool } = require('../config/db');
const slugify  = require('slugify');

// ── Helper: fetch child arrays for a product ──────────────────
const fetchChildren = async (productId) => {
  const [images, specs, packaging, countries] = await Promise.all([
    pool.query(`SELECT url FROM product_images WHERE product_id = $1 ORDER BY sort_order`, [productId]),
    pool.query(`SELECT label, value FROM product_specifications WHERE product_id = $1 ORDER BY sort_order`, [productId]),
    pool.query(`SELECT option FROM product_packaging WHERE product_id = $1 ORDER BY sort_order`, [productId]),
    pool.query(`SELECT country FROM product_export_countries WHERE product_id = $1`, [productId]),
  ]);
  return {
    images:          images.rows.map((r) => r.url),
    specifications:  specs.rows,
    packaging:       packaging.rows.map((r) => r.option),
    exportCountries: countries.rows.map((r) => r.country),
  };
};

// ── Helper: attach child arrays to a product row ──────────────
const withChildren = async (row) => {
  if (!row) return null;
  const children = await fetchChildren(row.id);
  return { ...row, ...children };
};

// ── Helper: insert child arrays for a product ─────────────────
const insertChildren = async (client, productId, { images = [], specifications = [], packaging = [], exportCountries = [] }) => {
  for (let i = 0; i < images.length; i++) {
    await client.query(
      `INSERT INTO product_images (product_id, url, sort_order) VALUES ($1, $2, $3)`,
      [productId, images[i], i]
    );
  }
  for (let i = 0; i < specifications.length; i++) {
    const spec = typeof specifications[i] === 'string' ? JSON.parse(specifications[i]) : specifications[i];
    await client.query(
      `INSERT INTO product_specifications (product_id, label, value, sort_order) VALUES ($1, $2, $3, $4)`,
      [productId, spec.label, spec.value, i]
    );
  }
  for (let i = 0; i < packaging.length; i++) {
    await client.query(
      `INSERT INTO product_packaging (product_id, option, sort_order) VALUES ($1, $2, $3)`,
      [productId, packaging[i], i]
    );
  }
  for (const country of exportCountries) {
    await client.query(
      `INSERT INTO product_export_countries (product_id, country) VALUES ($1, $2)`,
      [productId, country]
    );
  }
};

// ── Count documents with filter ───────────────────────────────
const countDocuments = async (filter = {}) => {
  const { where, values } = buildWhere(filter);
  const { rows } = await pool.query(`SELECT COUNT(*) FROM products ${where}`, values);
  return parseInt(rows[0].count);
};

// ── Build WHERE clause from a simple filter object ────────────
const buildWhere = (filter) => {
  const clauses = [];
  const values  = [];
  let   idx     = 1;

  if (filter.status)   { clauses.push(`status = $${idx++}`);   values.push(filter.status); }
  if (filter.category) { clauses.push(`category = $${idx++}`); values.push(filter.category); }
  if (filter.search) {
    clauses.push(
      `to_tsvector('english', title || ' ' || short_description || ' ' || description) @@ plainto_tsquery('english', $${idx++})`
    );
    values.push(filter.search);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, values };
};

// ── List products with pagination ─────────────────────────────
const find = async (filter = {}, { sort = 'created_at DESC', skip = 0, limit = 12 } = {}) => {
  const { where, values } = buildWhere(filter);
  const offsetIdx  = values.length + 1;
  const limitIdx   = values.length + 2;

  const { rows } = await pool.query(
    `SELECT id, title, slug, short_description, category, origin, moq,
            shelf_life, hsn_code, featured_image, status,
            meta_title, meta_description, created_at, updated_at
     FROM products ${where}
     ORDER BY ${sort}
     OFFSET $${offsetIdx} LIMIT $${limitIdx}`,
    [...values, skip, limit]
  );
  return rows;
};

// ── Find single product by ID or slug ────────────────────────
const findOne = async (filter = {}) => {
  const clauses = [];
  const values  = [];
  let   idx     = 1;

  if (filter.id)     { clauses.push(`id = $${idx++}`);     values.push(filter.id); }
  if (filter.slug)   { clauses.push(`slug = $${idx++}`);   values.push(filter.slug); }
  if (filter.status) { clauses.push(`status = $${idx++}`); values.push(filter.status); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT * FROM products ${where} LIMIT 1`,
    values
  );
  return withChildren(rows[0] || null);
};

// ── Create product (with child arrays in transaction) ─────────
const create = async (data) => {
  const slug = slugify(data.title, { lower: true, strict: true });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO products
         (title, slug, short_description, description, category,
          origin, moq, shelf_life, hsn_code, featured_image,
          status, meta_title, meta_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        data.title, slug, data.shortDescription || data.short_description,
        data.description, data.category, data.origin, data.moq,
        data.shelfLife || data.shelf_life || null,
        data.hsnCode   || data.hsn_code   || null,
        data.featuredImage || data.featured_image || null,
        data.status || 'active',
        data.metaTitle       || data.meta_title       || null,
        data.metaDescription || data.meta_description || null,
      ]
    );
    const product = rows[0];

    await insertChildren(client, product.id, {
      images:          data.images || [],
      specifications:  data.specifications || [],
      packaging:       data.packaging || [],
      exportCountries: data.exportCountries || data.export_countries || [],
    });

    await client.query('COMMIT');
    return withChildren(product);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ── Update product ────────────────────────────────────────────
const findByIdAndUpdate = async (id, data) => {
  const existing = await findOne({ id });
  if (!existing) return null;

  const slug = data.title
    ? slugify(data.title, { lower: true, strict: true })
    : existing.slug;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE products SET
         title             = COALESCE($1, title),
         slug              = $2,
         short_description = COALESCE($3, short_description),
         description       = COALESCE($4, description),
         category          = COALESCE($5, category),
         origin            = COALESCE($6, origin),
         moq               = COALESCE($7, moq),
         shelf_life        = COALESCE($8, shelf_life),
         hsn_code          = COALESCE($9, hsn_code),
         featured_image    = COALESCE($10, featured_image),
         status            = COALESCE($11, status),
         meta_title        = COALESCE($12, meta_title),
         meta_description  = COALESCE($13, meta_description),
         updated_at        = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        data.title || null, slug,
        data.shortDescription || data.short_description || null,
        data.description || null,
        data.category || null,
        data.origin   || null,
        data.moq      || null,
        data.shelfLife || data.shelf_life || null,
        data.hsnCode   || data.hsn_code   || null,
        data.featuredImage || data.featured_image || null,
        data.status || null,
        data.metaTitle       || data.meta_title       || null,
        data.metaDescription || data.meta_description || null,
        id,
      ]
    );

    // If new images provided, append them
    if (data.images && data.images.length > 0) {
      const existingCount = await client.query(
        `SELECT COUNT(*) FROM product_images WHERE product_id = $1`, [id]
      );
      const startOrder = parseInt(existingCount.rows[0].count);
      for (let i = 0; i < data.images.length; i++) {
        await client.query(
          `INSERT INTO product_images (product_id, url, sort_order) VALUES ($1, $2, $3)`,
          [id, data.images[i], startOrder + i]
        );
      }
    }

    await client.query('COMMIT');
    return withChildren(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ── Delete product ────────────────────────────────────────────
const findByIdAndDelete = async (id) => {
  const product = await withChildren(
    (await pool.query(`SELECT * FROM products WHERE id = $1 LIMIT 1`, [id])).rows[0]
  );
  if (!product) return null;
  // Child rows deleted via CASCADE in schema.sql
  await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
  return product;
};

module.exports = {
  countDocuments,
  find,
  findOne,
  create,
  findByIdAndUpdate,
  findByIdAndDelete,
};
