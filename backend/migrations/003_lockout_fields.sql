-- Migration 003: Account lockout fields for brute-force protection
-- Run: node run-migration.js (or apply directly via psql)

ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lockout_until   TIMESTAMPTZ;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lockout_until   TIMESTAMPTZ;

-- Index to speed up lockout checks on login
CREATE INDEX IF NOT EXISTS idx_admins_lockout ON admins (email, lockout_until);
CREATE INDEX IF NOT EXISTS idx_users_lockout  ON users  (email, lockout_until);
