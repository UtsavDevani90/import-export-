// validators/authValidators.js — Joi schemas for authentication endpoints

const Joi = require('joi');

// ── Common password rule ──────────────────────────────────────
const passwordRule = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[a-z]/, 'lowercase')
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/[0-9]/, 'number')
  .messages({
    'string.min':     'Password must be at least 8 characters',
    'string.max':     'Password must not exceed 128 characters',
    'string.pattern.name': 'Password must contain at least one {#name} letter/digit',
  });

// ── Admin login ───────────────────────────────────────────────
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(254)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(1)
    .max(128)
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

// ── Admin register ────────────────────────────────────────────
const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({ 'any.required': 'Name is required' }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(254)
    .required(),
  password: passwordRule.required(),
  // role is intentionally ignored — controller forces 'admin'
  role: Joi.string().valid('admin', 'superadmin').optional(),
});

// ── Change password ───────────────────────────────────────────
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(1).max(128).required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: passwordRule.required().messages({
    'any.required': 'New password is required',
  }),
});

// ── User register (portal) ────────────────────────────────────
const userRegisterSchema = Joi.object({
  full_name:    Joi.string().trim().min(2).max(100).required(),
  email:        Joi.string().email({ tlds: { allow: false } }).max(254).required(),
  password:     passwordRule.required(),
  phone:        Joi.string().trim().max(20).optional().allow('', null),
  company_name: Joi.string().trim().max(150).optional().allow('', null),
  country:      Joi.string().trim().max(100).optional().allow('', null),
});

// ── User login (portal) ───────────────────────────────────────
const userLoginSchema = Joi.object({
  email:    Joi.string().email({ tlds: { allow: false } }).max(254).required(),
  password: Joi.string().min(1).max(128).required(),
});

module.exports = {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  userRegisterSchema,
  userLoginSchema,
};
