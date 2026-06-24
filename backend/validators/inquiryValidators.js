// validators/inquiryValidators.js — Joi schemas for inquiry/contact form submissions

const Joi = require('joi');

// ── Submit inquiry (public contact form) ─────────────────────
const submitInquirySchema = Joi.object({
  name:     Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Name is required',
    'string.min':   'Name must be at least 2 characters',
    'string.max':   'Name must not exceed 100 characters',
  }),
  company:  Joi.string().trim().max(150).optional().allow('', null),
  email:    Joi.string().email({ tlds: { allow: false } }).max(254).required().messages({
    'any.required': 'Email address is required',
    'string.email': 'Please provide a valid email address',
  }),
  phone:    Joi.string()
    .trim()
    .max(20)
    .pattern(/^[+\d\s()\-\.]{0,20}$/)
    .optional()
    .allow('', null)
    .messages({ 'string.pattern.base': 'Phone number contains invalid characters' }),
  country:  Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Country is required',
  }),
  product:  Joi.string().trim().max(200).optional().allow('', null),
  quantity: Joi.string().trim().max(100).optional().allow('', null),
  subject:  Joi.string().trim().max(200).optional().allow('', null),
  message:  Joi.string().trim().max(2000).optional().allow('', null),

  // Turnstile token (validated separately by middleware)
  'cf-turnstile-response': Joi.string().optional().allow('', null),
});

// ── Update inquiry status (admin) ─────────────────────────────
const updateInquiryStatusSchema = Joi.object({
  status: Joi.string()
    .valid('new', 'read', 'replied', 'closed', 'spam')
    .required()
    .messages({ 'any.required': 'Status is required' }),
  adminNotes: Joi.string().trim().max(1000).optional().allow('', null),
});

// ── Add inquiry note (admin) ──────────────────────────────────
const addInquiryNoteSchema = Joi.object({
  note: Joi.string().trim().min(1).max(1000).required().messages({
    'any.required': 'Note text is required',
    'string.empty': 'Note text cannot be empty',
  }),
});

module.exports = {
  submitInquirySchema,
  updateInquiryStatusSchema,
  addInquiryNoteSchema,
};
