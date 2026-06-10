// ════════════════════════════════════════════════════════════
//  config/db.js — PostgreSQL Connection Pool
//  • Uses the 'pg' library with a connection pool
//  • Reads credentials from individual DB_* env vars (local dev)
//  • Falls back to DATABASE_URL for hosted environments (Render, etc.)
// ════════════════════════════════════════════════════════════

const { Pool } = require('pg');
const logger   = require('../utils/logger');

// ── Determine connection config ───────────────────────────────
const isHosted = !!process.env.DATABASE_URL;

const pool = new Pool(
  isHosted
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Required for Render/Heroku/Supabase
      }
    : {
        user:     process.env.DB_USER,
        host:     process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port:     parseInt(process.env.DB_PORT) || 5432,
        // No SSL for local PostgreSQL
      }
);

// ── Pool-level error handler ──────────────────────────────────
pool.on('error', (err) => {
  logger.error(`❌  PostgreSQL pool error: ${err.message}`);
});

// ── Connect & verify on startup ───────────────────────────────
const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('✅  PostgreSQL Connected Successfully');
    client.release();
  } catch (err) {
    logger.error(`❌  PostgreSQL connection failed: ${err.message}`);
    logger.error('💀  Check your DB_* environment variables and ensure PostgreSQL is running.');
    process.exit(1);
  }
};

module.exports = { pool, connectDB };