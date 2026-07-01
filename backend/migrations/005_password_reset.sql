-- ════════════════════════════════════════════════════════════════════
--  Migration 005 — Password Reset Columns
--  Adds two columns to the `users` table for password reset tokens.
--  SAFE: Uses ADD COLUMN IF NOT EXISTS — idempotent, safe to re-run.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_password_token   TEXT,
  ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMPTZ;

-- Index for fast token lookups (only non-null tokens)
CREATE INDEX IF NOT EXISTS idx_users_reset_token
  ON users (reset_password_token)
  WHERE reset_password_token IS NOT NULL;

COMMENT ON COLUMN users.reset_password_token   IS 'SHA-256 hex hash of the raw reset token — never store plaintext';
COMMENT ON COLUMN users.reset_password_expires IS 'Token expiry timestamp — 1 hour from request time';
