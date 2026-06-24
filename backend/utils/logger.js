// utils/logger.js — Winston structured logger
// Security hardened:
//   • Redact helper strips sensitive fields before logging
//   • Production: JSON format to files only
//   • Development: coloured console output
//   • Never log raw passwords, tokens, or secrets

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs   = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors } = format;

// ── Fields to redact from log output ─────────────────────────
const SENSITIVE_FIELDS = new Set([
  'password', 'password_hash', 'token', 'secret', 'authorization',
  'jwt', 'cookie', 'admin_token', 'user_token', 'refresh_token',
  'admin_refresh_token', 'user_refresh_token', 'DATABASE_URL',
  'JWT_SECRET', 'JWT_REFRESH_SECRET', 'GOOGLE_CLIENT_SECRET',
  'TURNSTILE_SECRET_KEY',
]);

// ── Redact sensitive keys from an object (deep) ───────────────
const redact = (obj, depth = 0) => {
  if (depth > 5 || !obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      result[key] = redact(val, depth + 1);
    } else {
      result[key] = val;
    }
  }
  return result;
};

// ── Custom console format ─────────────────────────────────────
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] ${stack || message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  ),
  transports: [
    // Error-only log file
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level:    'error',
      maxsize:  5 * 1024 * 1024,  // 5 MB
      maxFiles: 5,
    }),
    // Combined log file (all levels)
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize:  10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// ── Pretty console output in development ─────────────────────
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'HH:mm:ss' }),
      consoleFormat
    ),
  }));
}

// ── Attach redact helper to logger instance ───────────────────
logger.redact = redact;

module.exports = logger;
