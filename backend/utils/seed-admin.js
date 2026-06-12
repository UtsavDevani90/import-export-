// utils/seed-admin.js — Safe Admin Password Seeder
// ════════════════════════════════════════════════════════════
// PURPOSE: Fix the PLACEHOLDER_HASH in the admins table by
//          inserting/updating admin records with real bcrypt hashes.
//
// SAFE:    • Does NOT drop or recreate any tables
//          • Does NOT touch any other table or data
//          • Uses INSERT ... ON CONFLICT DO UPDATE (upsert)
//          • Idempotent — safe to run multiple times
//
// RUN:     node backend/utils/seed-admin.js
//          (from the project root, with backend/.env loaded)
//
// OR from inside backend/:
//          node utils/seed-admin.js
// ════════════════════════════════════════════════════════════

require('dotenv').config();  // Loads backend/.env automatically when run from backend/

const { Pool }  = require('pg');
const bcrypt    = require('bcryptjs');

// ── Resolve .env from backend/ directory when run from root ──
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ── Admin accounts to seed / fix ─────────────────────────────
// ⚠️  IMPORTANT: Change these passwords before running in production!
//     After running this script, log in and change your password via the dashboard.
const ADMINS = [
  {
    name:     'Utsav Devani', 
   email: 'utsavdevani90@gmail.com',
   password: 'TanzoraAdmin123',      // ← CHANGE THIS before running
    role:     'superadmin',
  }, 
  {
    name:     'Arjun Bhavani',
    email:    'arjun@tanzoraexport.com',
    password: 'Admin@1234',      // ← CHANGE THIS before running
    role:     'admin',
  },
];

// ── Database connection ───────────────────────────────────────
const pool = new Pool(
  process.env.DATABASE_URL
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

async function seedAdmins() {
  console.log('\n🔐  Tanzora Admin Password Seeder');
  console.log('─'.repeat(50));

  const client = await pool.connect();

  try {
    for (const admin of ADMINS) {
      // Hash the password with bcrypt cost factor 12 (same as Admin.create)
      const salt   = await bcrypt.genSalt(12);
      const hashed = await bcrypt.hash(admin.password, salt);

      // Upsert: insert if not exists, update password if exists
      // This NEVER touches any other rows or tables
      const result = await client.query(
        `INSERT INTO admins (name, email, password, role, is_active)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (email)
         DO UPDATE SET
           password   = EXCLUDED.password,
           name       = EXCLUDED.name,
           role       = EXCLUDED.role,
           updated_at = NOW()
         RETURNING id, name, email, role, is_active`,
        [admin.name, admin.email.toLowerCase().trim(), hashed, admin.role]
      );

      const row = result.rows[0];
      console.log(`✅  ${row.email}  →  role: ${row.role}  |  id: ${row.id}`);

      // Immediately verify bcrypt can compare the stored hash
      const verify = await bcrypt.compare(admin.password, hashed);
      if (!verify) {
        throw new Error(`bcrypt verification FAILED for ${admin.email}`);
      }
      console.log(`    ✓  bcrypt hash verified successfully`);
    }

    console.log('\n🎉  All admin passwords seeded and verified!');
    console.log('    You can now log in with the credentials above.');
    console.log('    ⚠️  Change these passwords after first login!\n');

  } catch (err) {
    console.error('\n❌  Seeder failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedAdmins();
