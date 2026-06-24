// ════════════════════════════════════════════════════════════════════
//  utils/initializeDB.js — Automatic Database Initialization
//  Runs on server startup to ensure all required data is seeded.
//  Safe: Idempotent, uses upserts, won't overwrite existing data.
//
//  SECURITY: All credentials come from environment variables ONLY.
//  Hardcoded defaults have been removed. Set these in Render/Railway:
//    ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
// ════════════════════════════════════════════════════════════════════

const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const logger = require('./logger');

// ── Resolve admin accounts from env vars only ─────────────────
const getAdminsToSeed = () => {
  const email    = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name     = process.env.ADMIN_NAME?.trim() || 'Admin';

  if (!email || !password) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn(
        '[DB INIT] ⚠️  ADMIN_EMAIL / ADMIN_PASSWORD not set. ' +
        'No admin will be seeded. Set these env vars in Render to create the initial admin.'
      );
    } else {
      logger.warn(
        '[DB INIT] ADMIN_EMAIL / ADMIN_PASSWORD not set in .env — skipping admin seed. ' +
        'Set them to seed an admin on startup.'
      );
    }
    return [];
  }

  return [{ name, email, password, role: 'superadmin' }];
};

// ── Hash a password with bcrypt ───────────────────────────────
const hashPassword = async (plainText) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainText, salt);
};

// ── Check if admin already exists ────────────────────────────
const adminExists = async (email) => {
  try {
    const { rows } = await pool.query(
      'SELECT id FROM admins WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );
    return rows.length > 0;
  } catch (err) {
    logger.error(`[initializeDB] Error checking admin existence: ${err.message}`);
    return false;
  }
};

// ── Seed an admin account (only if it does not exist) ─────────
const seedAdmin = async (admin) => {
  try {
    const hashedPassword = await hashPassword(admin.password);

    const { rows } = await pool.query(
      `INSERT INTO admins (name, email, password, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, name, email, role`,
      [
        admin.name.trim(),
        admin.email.toLowerCase().trim(),
        hashedPassword,
        admin.role,
        true,
      ]
    );

    if (rows[0]) {
      logger.info(`✅  Admin seeded: ${rows[0].email} | role: ${rows[0].role} | id: ${rows[0].id}`);
    } else {
      logger.info(`[DB INIT] Admin already exists: ${admin.email} (skipped)`);
    }

    return rows[0] || null;
  } catch (err) {
    logger.error(`❌  Failed to seed admin ${admin.email}: ${err.message}`);
    throw err;
  }
};

// ── Run pending migrations from /migrations/*.sql ─────────────
const runMigrations = async () => {
  const fs   = require('fs');
  const path = require('path');
  const migrationsDir = path.join(__dirname, '../migrations');

  if (!fs.existsSync(migrationsDir)) return;

  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    try {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await pool.query(sql);
      logger.info(`[DB INIT] Migration applied: ${file}`);
    } catch (err) {
      // IF NOT EXISTS guards make these safe to re-run
      if (!err.message.includes('already exists')) {
        logger.warn(`[DB INIT] Migration skipped/warning (${file}): ${err.message}`);
      }
    }
  }
};

// ── Main initialization function ──────────────────────────────
const initializeDatabase = async () => {
  const logTag = '[DB INIT]';

  try {
    logger.info(`${logTag} Starting automatic database initialization...`);

    // Verify connection
    const client = await pool.connect();
    client.release();
    logger.info(`${logTag} Database connection verified`);

    // Run migrations (idempotent — safe to run every startup)
    await runMigrations();

    // Check if admins table exists
    const { rows: tableCheck } = await pool.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_name = 'admins'
       )`
    );

    if (!tableCheck[0].exists) {
      logger.warn(`${logTag} ⚠️  Admins table does not exist. Skipping initialization.`);
      logger.warn(`${logTag}    Run migrations first: node run-migration.js`);
      return false;
    }

    logger.info(`${logTag} Admins table verified`);

    // Seed admin accounts from env vars
    const adminsToSeed = getAdminsToSeed();
    logger.info(`${logTag} Found ${adminsToSeed.length} admin(s) to seed`);

    let seededCount = 0;
    for (const admin of adminsToSeed) {
      const exists = await adminExists(admin.email);
      if (!exists) {
        await seedAdmin(admin);
        seededCount++;
      } else {
        logger.info(`${logTag} Admin already exists: ${admin.email} (skipping)`);
      }
    }

    logger.info(`${logTag} ✅  Database initialization complete! Seeded: ${seededCount} new admin(s)`);
    return true;
  } catch (err) {
    logger.error(`${logTag} ❌  Database initialization FAILED: ${err.message}`);
    // Don't crash the server — just warn
    return false;
  }
};

module.exports = { initializeDatabase };
