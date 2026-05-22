// middleware/errorMiddleware.js — Centralized error handler
// Express calls this when any route or middleware calls next(err).
// Returns consistent JSON error responses in all environments.

const logger = require('../utils/logger');

// ── 404 handler — place before errorHandler in server.js ─────
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// ── Global error handler ──────────────────────────────────────
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || err.status || 500;
  let message    = err.message || 'Internal Server Error';

  // ── Mongoose: cast error (bad ObjectId format) ────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid ${err.path}: ${err.value}`;
  }

  // ── Mongoose: duplicate key ───────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    statusCode = 409;
    message    = `A record with this ${field} already exists`;
  }

  // ── Mongoose: validation errors ───────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    const errors = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // ── JWT errors ────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Authentication token expired — please log in again';
  }

  // ── Log server errors (5xx) ───────────────────────────────
  if (statusCode >= 500) {
    logger.error(`${statusCode} — ${message}`, {
      url:    req.originalUrl,
      method: req.method,
      stack:  err.stack,
    });
  }

  // ── Response ──────────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack traces in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
