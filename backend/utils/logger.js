// utils/logger.js — Winston structured logger
// Outputs coloured logs to console in dev, JSON files in production.

const { createLogger, format, transports } = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, errors } = format;

// ── Custom console format ─────────────────────────────────────
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] ${stack || message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),      // Log full stack traces
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()                 // JSON format for log files
  ),
  transports: [
    // Always log errors to file
    new transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,  // 5 MB max
      maxFiles: 5,
    }),
    // Combined log file for all levels
    new transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 10 * 1024 * 1024,
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

module.exports = logger;
