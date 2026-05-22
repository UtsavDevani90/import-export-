const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error(`❌ PostgreSQL pool error: ${err.message}`);
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('✅ PostgreSQL Connected Successfully');
    client.release();
  } catch (err) {
    logger.error(`❌ PostgreSQL connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };