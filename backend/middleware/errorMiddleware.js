// middleware/errorMiddleware.js — Centralized error handler
// Security hardened:
//   • PostgreSQL-specific error codes handled
//   • Stack traces NEVER sent in production responses
//   • Generic messages for 5xx — no internal info leakage
//   • Mongoose stubs removed (project uses PostgreSQL only)

const logger = require('../utils/logger');

// ── 404 handler — place before errorHandler in server.js ─────
const notFound = (req, res, next) => {
  const error = new Error(`Not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// ── Map PostgreSQL error codes to HTTP responses ──────────────
const handlePgError = (err) => {
  switch (err.code) {
    case '23505': // unique_violation
      return { status: 409, message: 'A record with this value already exists' };
    case '23503': // foreign_key_violation
      return { status: 400, message: 'Related record not found' };
    case '23502': // not_null_violation
      return { status: 400, message: `Required field "${err.column}" is missing` };
    case '22P02': // invalid_text_representation (e.g. bad UUID)
      return { status: 400, message: 'Invalid ID format' };
    case '42P01': // undefined_table
      return { status: 500, message: 'Database configuration error' };
    default:
      return null;
  }
};

// ── Global error handler ──────────────────────────────────────
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const isProduction = process.env.NODE_ENV === 'production';

  let statusCode = err.statusCode || err.status || 500;
  let message    = err.message || 'Internal Server Error';

  // ── PostgreSQL error codes ────────────────────────────────
  if (err.code && typeof err.code === 'string' && err.code.length === 5) {
    const pgResult = handlePgError(err);
    if (pgResult) {
      statusCode = pgResult.status;
      message    = pgResult.message;
    }
  }

  // ── JWT errors ─────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Authentication token expired — please log in again';
  }

  // ── CORS errors ───────────────────────────────────────────
  if (err.message?.includes('CORS')) {
    statusCode = 403;
    message    = 'Cross-origin request blocked';
  }

  // ── Log server errors (5xx) ───────────────────────────────
  if (statusCode >= 500) {
    logger.error(`${statusCode} — ${err.message}`, {
      url:    req.originalUrl,
      method: req.method,
      stack:  err.stack,
      pgCode: err.code,
    });
    // In production: never expose the real error message for 5xx
    if (isProduction) {
      message = 'An internal server error occurred. Please try again later.';
    }
  }

  // ── Response ──────────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    message,
    // Stack trace only in development — NEVER in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
