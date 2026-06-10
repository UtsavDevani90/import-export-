// run-migration.js — Executes migration SQL against the configured database
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const isHosted = !!process.env.DATABASE_URL;

const pool = new Pool(
  isHosted
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user:     process.env.DB_USER,
        host:     process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port:     parseInt(process.env.DB_PORT) || 5432,
      }
);

async function run() {
  const sql = fs.readFileSync(
    path.join(__dirname, 'migrations', '001_admin_dashboard.sql'),
    'utf8'
  );

  const client = await pool.connect();
  try {
    console.log('⏳ Running migration 001_admin_dashboard.sql ...');
    await client.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
