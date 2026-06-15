// ════════════════════════════════════════════════════════════════════
//  utils/initializeDB.js — Automatic Database Initialization
//  Runs on server startup to ensure all required data is seeded
//  Safe: Idempotent, uses upserts, won't overwrite production data
// ════════════════════════════════════════════════════════════════════

const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const logger = require('./logger');

// ── Admin accounts to auto-seed (read from env or use defaults) ──
const getAdminsToSeed = () => {
  // If env vars are set, prioritize them (for production secrets)
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    return [
      {
        name: process.env.ADMIN_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'superadmin',
      },
    ];
  }

  // Otherwise use default development accounts
  return [
    {
      name: 'Utsav Devani',
      email: 'utsavdevani90@gmail.com',
      password: 'TanzoraAdmin123',
      role: 'superadmin',
    },
    {
      name: 'Arjun Bhavani',
      email: 'arjun@tanzoraexport.com',
      password: 'Admin@1234',
      role: 'admin',
    },
  ];
};

// ── Hash a password with bcrypt ───────────────────────────────────
const hashPassword = async (plainText) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainText, salt);
};

// ── Check if admin exists ─────────────────────────────────────────
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

// ── Seed or update an admin account ───────────────────────────────
const seedAdmin = async (admin) => {
  try {
    const hashedPassword = await hashPassword(admin.password);
    
    const { rows } = await pool.query(
      `INSERT INTO admins (name, email, password, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) 
       DO UPDATE SET 
         password = $3,
         role = $4,
         is_active = TRUE,
         updated_at = NOW()
       RETURNING id, name, email, role`,
      [
        admin.name.trim(),
        admin.email.toLowerCase().trim(),
        hashedPassword,
        admin.role,
        true,
      ]
    );

    const createdAdmin = rows[0];
    logger.info(
      `✅  Admin seeded: ${createdAdmin.email} | role: ${createdAdmin.role} | id: ${createdAdmin.id}`
    );

    return createdAdmin;
  } catch (err) {
    logger.error(
      `❌  Failed to seed admin ${admin.email}: ${err.message}`
    );
    throw err;
  }
};

// ── Main initialization function ──────────────────────────────────
const initializeDatabase = async () => {
  const logTag = '[DB INIT]';

  try {
    logger.info(`${logTag} Starting automatic database initialization...`);

    // Verify connection
    const client = await pool.connect();
    client.release();

    logger.info(`${logTag} Database connection verified`);

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

    // Get admins to seed
    const adminsToSeed = getAdminsToSeed();
    logger.info(`${logTag} Found ${adminsToSeed.length} admin(s) to seed`);

    // Seed each admin
    let seededCount = 0;
    for (const admin of adminsToSeed) {
      const exists = await adminExists(admin.email);
      
      if (exists) {
        logger.info(`${logTag} Admin already exists: ${admin.email} (skipping update)`);
      } else {
        await seedAdmin(admin);
        seededCount++;
      }
    }

    logger.info(`${logTag} ✅  Database initialization complete! Seeded: ${seededCount} new admin(s)`);
    return true;
  } catch (err) {
    logger.error(`${logTag} ❌  Database initialization FAILED: ${err.message}`);
    logger.error(`${logTag}    ${err.stack}`);
    
    // Don't crash the server, just warn
    console.error(`${logTag} WARNING: Database initialization failed, but server is still running.`);
    console.error(`${logTag} You may need to manually seed admins. See backend/utils/seed-admin.js`);
    
    return false;
  }
};

module.exports = { initializeDatabase };
