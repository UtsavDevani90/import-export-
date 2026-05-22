// utils/generateToken.js — JWT token generator
// Signs a JWT that encodes the admin's id and role.
// The secret and expiry come from environment variables.

const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT access token.
 * @param   {Object} payload - Data to encode (id, role)
 * @returns {string} Signed JWT string
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;
