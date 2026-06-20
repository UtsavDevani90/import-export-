-- ════════════════════════════════════════════════════════════════════
--  Migration 004 — Tanzora Export: Google OAuth Support
--  SAFE:  Additive only. No existing data is modified or deleted.
--  RUN:   node backend/run-migration-004.js
-- ════════════════════════════════════════════════════════════════════

-- Make password_hash nullable so Google-only users don't need a password.
-- Existing rows retain their hashes; this is a metadata-only change.
ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

-- Add google_id — the stable "sub" value from Google's token.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Add avatar — Google profile picture URL (may be updated on next login).
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Fast lookup on OAuth callback: find existing user by google_id.
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id);

COMMENT ON COLUMN users.password_hash IS 'bcrypt hash (cost 12). NULL for Google-only accounts.';
COMMENT ON COLUMN users.google_id     IS 'Google OAuth2 sub identifier. Unique per Google account.';
COMMENT ON COLUMN users.avatar        IS 'Profile picture URL from Google (or user-uploaded later).';

-- ════════════════════════════════════════════════════════════════════
--  MIGRATION COMPLETE
--  Changed:  users.password_hash → nullable
--  Added:    users.google_id (VARCHAR 255, UNIQUE)
--            users.avatar    (TEXT)
--  Safe to re-run: all statements use IF NOT EXISTS / idempotent ALTER
-- ════════════════════════════════════════════════════════════════════
