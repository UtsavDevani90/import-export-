// validators/blogValidators.js — Joi schemas for blog CRUD

const Joi = require('joi');

// ── Create blog post ──────────────────────────────────────────
const createBlogSchema = Joi.object({
  title:          Joi.string().trim().min(3).max(300).required(),
  slug:           Joi.string().trim().max(320).optional().allow('', null),
  excerpt:        Joi.string().trim().max(600).optional().allow('', null),
  // content is rich HTML — sanitized by sanitizeRichBody middleware before reaching controller
  content:        Joi.string().max(500000).optional().allow('', null),
  category:       Joi.string().trim().max(100).optional().allow('', null),
  tags:           Joi.alternatives().try(Joi.array(), Joi.string()).optional().allow('', null),
  author_name:    Joi.string().trim().max(150).optional().allow('', null),
  status:         Joi.string().valid('draft', 'published', 'archived').default('draft'),
  featured_image: Joi.string().optional().allow('', null),
  featuredImage:  Joi.string().optional().allow('', null),
  published_at:   Joi.date().iso().optional().allow(null),
  meta_title:     Joi.string().trim().max(160).optional().allow('', null),
  meta_desc:      Joi.string().trim().max(320).optional().allow('', null),
}).unknown(false);

// ── Update blog post (all optional) ──────────────────────────
const updateBlogSchema = createBlogSchema
  .fork(Object.keys(createBlogSchema.describe().keys), (schema) => schema.optional())
  .unknown(false);

// ── Query params for blog listing ─────────────────────────────
const blogQuerySchema = Joi.object({
  page:   Joi.number().integer().min(1).max(10000).default(1),
  limit:  Joi.number().integer().min(1).max(50).default(9),
  tag:    Joi.string().trim().max(100).optional().allow('', null),
  search: Joi.string().trim().max(200).optional().allow('', null),
  status: Joi.string().valid('draft', 'published', 'archived').optional(),
});

module.exports = {
  createBlogSchema,
  updateBlogSchema,
  blogQuerySchema,
};
