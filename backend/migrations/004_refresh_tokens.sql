-- Migration 004: Refresh token table for secure token rotation
-- Supports both admin and user refresh tokens in a single table.

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash   TEXT        NOT NULL UNIQUE,          -- SHA-256 of the raw token
  admin_id     UUID        REFERENCES admins(id) ON DELETE CASCADE,
  user_id      UUID        REFERENCES users(id)  ON DELETE CASCADE,
  account_type TEXT        NOT NULL CHECK (account_type IN ('admin', 'user')),
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ,
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  -- Only one of admin_id / user_id may be set
  CONSTRAINT chk_one_owner CHECK (
    (admin_id IS NOT NULL AND user_id IS NULL) OR
    (user_id  IS NOT NULL AND admin_id IS NULL)
  )
);

-- Fast lookup by hash on every refresh call
CREATE INDEX IF NOT EXISTS idx_rt_token_hash   ON refresh_tokens (token_hash);
-- Cleanup old tokens by expiry
CREATE INDEX IF NOT EXISTS idx_rt_expires_at   ON refresh_tokens (expires_at);
-- Admin-scoped token lookup
CREATE INDEX IF NOT EXISTS idx_rt_admin_id     ON refresh_tokens (admin_id);
-- User-scoped token lookup
CREATE INDEX IF NOT EXISTS idx_rt_user_id      ON refresh_tokens (user_id);
