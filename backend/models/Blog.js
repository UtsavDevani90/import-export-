// models/Blog.js — Blog post queries (PostgreSQL)
// All Mongoose logic removed. Tags stored in blog_tags child table.

const { pool } = require('../config/db');
const slugify  = require('slugify');

// ── Helper: fetch tags for a blog post ───────────────────────
const fetchTags = async (blogId) => {
  const { rows } = await pool.query(
    `SELECT tag FROM blog_tags WHERE blog_id = $1 ORDER BY tag`,
    [blogId]
  );
  return rows.map((r) => r.tag);
};

// ── Helper: attach tags to a blog row ────────────────────────
const withTags = async (row) => {
  if (!row) return null;
  const tags = await fetchTags(row.id);
  return { ...row, tags };
};

// ── Helper: insert tags for a blog post ──────────────────────
const insertTags = async (client, blogId, tags = []) => {
  for (const tag of tags) {
    await client.query(
      `INSERT INTO blog_tags (blog_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [blogId, tag.toLowerCase().trim()]
    );
  }
};

// ── Build WHERE clause ────────────────────────────────────────
const buildWhere = (filter) => {
  const clauses = [];
  const values  = [];
  let   idx     = 1;

  if (filter.status) { clauses.push(`b.status = $${idx++}`); values.push(filter.status); }
  if (filter.tag) {
    clauses.push(
      `EXISTS (SELECT 1 FROM blog_tags bt WHERE bt.blog_id = b.id AND bt.tag = $${idx++})`
    );
    values.push(filter.tag);
  }
  if (filter.search) {
    clauses.push(
      `to_tsvector('english', b.title || ' ' || COALESCE(b.excerpt,'')) @@ plainto_tsquery('english', $${idx++})`
    );
    values.push(filter.search);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, values };
};

// ── Count documents ───────────────────────────────────────────
const countDocuments = async (filter = {}) => {
  const { where, values } = buildWhere(filter);
  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM blogs b ${where}`,
    values
  );
  return parseInt(rows[0].count);
};

// ── List blogs ────────────────────────────────────────────────
const find = async (filter = {}, { sort = 'published_at DESC', skip = 0, limit = 9, select } = {}) => {
  const { where, values } = buildWhere(filter);
  const offsetIdx = values.length + 1;
  const limitIdx  = values.length + 2;

  const columns = select ||
    'b.id, b.title, b.slug, b.excerpt, b.featured_image, b.author_name, b.category, b.views, b.published_at, b.status, b.created_at, b.updated_at';

  const { rows } = await pool.query(
    `SELECT ${columns} FROM blogs b ${where} ORDER BY ${sort} OFFSET $${offsetIdx} LIMIT $${limitIdx}`,
    [...values, skip, limit]
  );

  // Attach tags to each row
  return Promise.all(rows.map(withTags));
};

// ── Find single blog ──────────────────────────────────────────
const findOne = async (filter = {}) => {
  const clauses = [];
  const values  = [];
  let   idx     = 1;

  if (filter.slug)   { clauses.push(`slug = $${idx++}`);   values.push(filter.slug); }
  if (filter.id)     { clauses.push(`id = $${idx++}`);     values.push(filter.id); }
  if (filter.status) { clauses.push(`status = $${idx++}`); values.push(filter.status); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(`SELECT * FROM blogs ${where} LIMIT 1`, values);
  return withTags(rows[0] || null);
};

// ── Find blog and increment views atomically ──────────────────
const findOneAndIncrementViews = async (filter = {}) => {
  const clauses = [];
  const values  = [];
  let   idx     = 1;

  if (filter.slug)   { clauses.push(`slug = $${idx++}`);   values.push(filter.slug); }
  if (filter.status) { clauses.push(`status = $${idx++}`); values.push(filter.status); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `UPDATE blogs SET views = views + 1, updated_at = NOW()
     WHERE id = (SELECT id FROM blogs ${where} LIMIT 1)
     RETURNING *`,
    values
  );
  return withTags(rows[0] || null);
};

// ── Create blog ───────────────────────────────────────────────
const create = async (data) => {
  const slug = slugify(data.title, { lower: true, strict: true });
  const publishedAt = (data.status === 'published') ? new Date() : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO blogs
         (title, slug, excerpt, content, featured_image,
          author_id, author_name, category,
          meta_title, meta_description,
          status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        data.title, slug,
        data.excerpt || null,
        data.content,
        data.featuredImage || data.featured_image || null,
        data.author || data.author_id,
        data.authorName || data.author_name || null,
        data.category || null,
        data.metaTitle || data.meta_title || null,
        data.metaDescription || data.meta_description || null,
        data.status || 'draft',
        publishedAt,
      ]
    );
    const blog = rows[0];
    await insertTags(client, blog.id, data.tags || []);
    await client.query('COMMIT');
    return withTags(blog);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ── Update blog ───────────────────────────────────────────────
const findByIdAndUpdate = async (id, data) => {
  const existing = await findOne({ id });
  if (!existing) return null;

  const slug = data.title
    ? slugify(data.title, { lower: true, strict: true })
    : existing.slug;

  let publishedAt = existing.published_at;
  if (data.status === 'published' && !publishedAt) {
    publishedAt = new Date();
  }

  const { rows } = await pool.query(
    `UPDATE blogs SET
       title            = COALESCE($1, title),
       slug             = $2,
       excerpt          = COALESCE($3, excerpt),
       content          = COALESCE($4, content),
       featured_image   = COALESCE($5, featured_image),
       category         = COALESCE($6, category),
       meta_title       = COALESCE($7, meta_title),
       meta_description = COALESCE($8, meta_description),
       status           = COALESCE($9, status),
       published_at     = $10,
       updated_at       = NOW()
     WHERE id = $11
     RETURNING *`,
    [
      data.title || null, slug,
      data.excerpt || null,
      data.content || null,
      data.featuredImage || data.featured_image || null,
      data.category || null,
      data.metaTitle || data.meta_title || null,
      data.metaDescription || data.meta_description || null,
      data.status || null,
      publishedAt,
      id,
    ]
  );
  return withTags(rows[0]);
};

// ── Delete blog ───────────────────────────────────────────────
const findByIdAndDelete = async (id) => {
  const blog = await findOne({ id });
  if (!blog) return null;
  // blog_tags deleted via CASCADE
  await pool.query(`DELETE FROM blogs WHERE id = $1`, [id]);
  return blog;
};

module.exports = {
  countDocuments,
  find,
  findOne,
  findOneAndIncrementViews,
  create,
  findByIdAndUpdate,
  findByIdAndDelete,
};
