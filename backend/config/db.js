// ════════════════════════════════════════════════════════════
//  config/db.js — PostgreSQL Connection Pool
//  • Reads DATABASE_URL for all hosted environments
//  • SSL: rejectUnauthorized=true in production (Neon supports verified TLS)
//  • rejectUnauthorized=false only for local dev with self-signed certs
// ════════════════════════════════════════════════════════════

const { Pool } = require('pg');
const logger   = require('../utils/logger');

const isProduction = process.env.NODE_ENV === 'production';
const isHosted     = !!process.env.DATABASE_URL;

// ── Build connection config ───────────────────────────────────
let poolConfig;

if (isHosted) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      // In production: enforce TLS certificate verification
      // Neon PostgreSQL provides valid certs signed by trusted CAs
      rejectUnauthorized: isProduction ? true : false,
    },
    // Connection pool settings
    max:             20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
} else {
  poolConfig = {
    user:     process.env.DB_USER,
    host:     process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port:     parseInt(process.env.DB_PORT) || 5432,
    // No SSL for local PostgreSQL (no self-signed cert)
    max:      10,
  };
}

const pool = new Pool(poolConfig);

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
    logger.error('💀  Check DATABASE_URL and ensure the database is accessible.');
    process.exit(1);
  }
};

module.exports = { pool, connectDB };