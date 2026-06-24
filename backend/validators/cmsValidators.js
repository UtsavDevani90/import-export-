// validators/cmsValidators.js — Joi schemas for CMS (testimonials, FAQs, stats)

const Joi = require('joi');

// ── Testimonial ───────────────────────────────────────────────
const createTestimonialSchema = Joi.object({
  client_name:    Joi.string().trim().min(2).max(100).required(),
  client_company: Joi.string().trim().max(150).optional().allow('', null),
  client_country: Joi.string().trim().max(100).optional().allow('', null),
  avatar:         Joi.string().max(500).optional().allow('', null),
  rating:         Joi.number().integer().min(1).max(5).optional(),
  // content sanitized by middleware
  content:        Joi.string().trim().min(10).max(2000).required(),
  is_active:      Joi.boolean().default(true),
  sort_order:     Joi.number().integer().min(0).optional(),
});

const updateTestimonialSchema = createTestimonialSchema
  .fork(Object.keys(createTestimonialSchema.describe().keys), (s) => s.optional())
  .unknown(false);

// ── FAQ ───────────────────────────────────────────────────────
const createFaqSchema = Joi.object({
  question:   Joi.string().trim().min(5).max(500).required(),
  answer:     Joi.string().trim().min(5).max(3000).required(),
  category:   Joi.string().trim().max(100).optional().allow('', null),
  sort_order: Joi.number().integer().min(0).optional(),
  is_active:  Joi.boolean().default(true),
});

const updateFaqSchema = createFaqSchema
  .fork(Object.keys(createFaqSchema.describe().keys), (s) => s.optional())
  .unknown(false);

// ── Stats (batch update) ──────────────────────────────────────
const updateStatsSchema = Joi.object({
  stats: Joi.array().items(
    Joi.object({
      id:          Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      key:         Joi.string().trim().max(100).optional(),
      value:       Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
      label:       Joi.string().trim().max(200).optional(),
      description: Joi.string().trim().max(500).optional().allow('', null),
      icon:        Joi.string().trim().max(100).optional().allow('', null),
      suffix:      Joi.string().trim().max(20).optional().allow('', null),
      prefix:      Joi.string().trim().max(20).optional().allow('', null),
      sort_order:  Joi.number().integer().min(0).optional(),
      is_active:   Joi.boolean().optional(),
    }).unknown(false)
  ).optional(),
}).unknown(true); // Allow flexible top-level keys for stat batch

// ── Reorder ───────────────────────────────────────────────────
const reorderSchema = Joi.object({
  orderedIds: Joi.array().items(
    Joi.alternatives().try(Joi.string(), Joi.number())
  ).min(1).required(),
});

module.exports = {
  createTestimonialSchema,
  updateTestimonialSchema,
  createFaqSchema,
  updateFaqSchema,
  updateStatsSchema,
  reorderSchema,
};
