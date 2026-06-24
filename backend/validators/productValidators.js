// validators/productValidators.js — Joi schemas for product CRUD

const Joi = require('joi');

// ── Allowed sort values (whitelist to prevent SQL injection) ──
const ALLOWED_SORTS = [
  'created_at DESC', 'created_at ASC',
  'title ASC', 'title DESC',
  'price ASC', 'price DESC',
  'updated_at DESC',
];

// ── Create product ────────────────────────────────────────────
const createProductSchema = Joi.object({
  title:             Joi.string().trim().min(2).max(200).required(),
  slug:              Joi.string().trim().max(220).optional().allow('', null),
  short_description: Joi.string().trim().max(500).optional().allow('', null),
  description:       Joi.string().trim().max(10000).optional().allow('', null),
  category:          Joi.string().trim().max(100).optional().allow('', null),
  price:             Joi.alternatives().try(Joi.number().min(0), Joi.string().allow('', null)).optional(),
  currency:          Joi.string().trim().max(10).optional().allow('', null),
  unit:              Joi.string().trim().max(50).optional().allow('', null),
  min_order:         Joi.alternatives().try(Joi.number().min(0), Joi.string().allow('', null)).optional(),
  origin:            Joi.string().trim().max(100).optional().allow('', null),
  hs_code:           Joi.string().trim().max(20).optional().allow('', null),
  status:            Joi.string().valid('active', 'inactive', 'draft').optional(),
  tags:              Joi.alternatives().try(Joi.array(), Joi.string()).optional().allow('', null),
  specifications:    Joi.alternatives().try(Joi.object(), Joi.string()).optional().allow('', null),
  featuredImage:     Joi.string().uri().optional().allow('', null),
  featured_image:    Joi.string().uri().optional().allow('', null),
}).unknown(false);

// ── Update product (all fields optional) ──────────────────────
const updateProductSchema = createProductSchema
  .fork(Object.keys(createProductSchema.describe().keys), (schema) => schema.optional())
  .unknown(false);

// ── Query params for product listing ─────────────────────────
const productQuerySchema = Joi.object({
  category: Joi.string().trim().max(100).optional().allow('', null),
  search:   Joi.string().trim().max(200).optional().allow('', null),
  page:     Joi.number().integer().min(1).max(10000).default(1),
  limit:    Joi.number().integer().min(1).max(100).default(12),
  sort:     Joi.string().valid(...ALLOWED_SORTS).default('created_at DESC').messages({
    'any.only': `Sort must be one of: ${ALLOWED_SORTS.join(', ')}`,
  }),
  status:   Joi.string().valid('active', 'inactive', 'draft').optional(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  ALLOWED_SORTS,
};
