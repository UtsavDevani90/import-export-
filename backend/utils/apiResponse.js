// utils/apiResponse.js — Standardized JSON response helpers
// Every controller uses these so the frontend always gets a
// consistent shape: { success, message, data?, errors? }

/**
 * Send a success response.
 * @param {Response} res - Express response object
 * @param {number}   statusCode - HTTP status (default 200)
 * @param {string}   message    - Human-readable message
 * @param {*}        data       - Payload to return
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
};

/**
 * Send an error response.
 * @param {Response} res
 * @param {number}   statusCode
 * @param {string}   message
 * @param {Array}    errors - Optional validation error array
 */
const sendError = (res, statusCode = 500, message = 'Server Error', errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
