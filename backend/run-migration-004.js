// run-migration-004.js — Execute migration 004: Google OAuth support
// Usage: node run-migration-004.js

require('dotenv').config();
const { Pool } = require('pg');
const fs       = require('fs');
const path     = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const sql = fs.readFileSync(
    path.join(__dirname, 'migrations/004_google_oauth.sql'),
    'utf8'
  );

  console.log('🚀  Running migration 004 — Google OAuth support...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅  Migration 004 completed successfully.');
    console.log('    • users.password_hash is now nullable');
    console.log('    • users.google_id column added (UNIQUE)');
    console.log('    • users.avatar column added');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌  Migration 004 FAILED:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
