// ════════════════════════════════════════════════════════════
//  config/db.js — PostgreSQL Connection Pool
//  • Uses the 'pg' library with a connection pool
//  • Reads credentials from environment variables (no MONGO_URI)
//  • Production-ready: tests the connection on startup
// ════════════════════════════════════════════════════════════

const { Pool } = require('pg');
const logger   = require('../utils/logger');

// ── Connection pool ───────────────────────────────────────────
const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:     parseInt(process.env.DB_PORT) || 5432,

  // Pool settings
  max:             10,    // Maximum number of connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Fail if no connection available in 5s
});

// ── Log pool errors ───────────────────────────────────────────
pool.on('error', (err) => {
  logger.error(`❌  PostgreSQL pool error: ${err.message}`);
});

// ── Connect & verify on startup ───────────────────────────────
const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('✅  PostgreSQL Connected Successfully');
    client.release(); // Return client to pool immediately after test
  } catch (err) {
    logger.error(`❌  PostgreSQL connection failed: ${err.message}`);
    logger.error('💀  Check your DB_* environment variables and ensure PostgreSQL is running.');
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
