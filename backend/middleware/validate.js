// middleware/validate.js — Generic Joi validation middleware factory
// Returns a middleware that validates req.body, req.params, or req.query.
// On failure: 422 with field-level errors.

const { sendError } = require('../utils/apiResponse');

/**
 * Validate request data using a Joi schema.
 * @param {import('joi').Schema} schema - The Joi schema to validate against.
 * @param {'body'|'params'|'query'} [target='body'] - Which part of req to validate.
 */
const validate = (schema, target = 'body') => (req, res, next) => {
  const data = req[target];

  const { error, value } = schema.validate(data, {
    abortEarly:    false,   // Collect all errors, not just first
    stripUnknown:  true,    // Remove fields not in schema
    convert:       true,    // Coerce types (e.g. string '5' → number 5)
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field:   d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Replace req[target] with the stripped/coerced value
  req[target] = value;
  next();
};

module.exports = { validate };
