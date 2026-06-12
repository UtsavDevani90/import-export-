-- ════════════════════════════════════════════════════════════════════
--  Migration 002 — Tanzora Export: User Dashboard Tables
--  SAFE:  Additive only. No existing tables modified destructively.
--  RUN:   psql $DATABASE_URL -f backend/migrations/002_users_dashboard.sql
-- ════════════════════════════════════════════════════════════════════

-- Ensure uuid extension exists (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ════════════════════════════════════════════════════════════════════
--  TABLE 1 — users
--  Separate from admins table. Buyer/portal accounts.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name      VARCHAR(100) NOT NULL
                              CONSTRAINT users_name_not_empty CHECK (TRIM(full_name) <> ''),
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  TEXT         NOT NULL,
  phone          VARCHAR(30),
  company_name   VARCHAR(150),
  country        VARCHAR(100),
  role           VARCHAR(10)  NOT NULL DEFAULT 'user'
                              CONSTRAINT users_role_check CHECK (role = 'user'),
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN      NOT NULL DEFAULT FALSE,
  last_login     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email   ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_country ON users (country);
CREATE INDEX IF NOT EXISTS idx_users_created ON users (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_active  ON users (is_active);

COMMENT ON TABLE  users                IS 'Portal user accounts (buyers) — separate from admins';
COMMENT ON COLUMN users.password_hash  IS 'bcrypt hash (cost 12) — NEVER store plaintext';
COMMENT ON COLUMN users.email_verified IS 'Set true after email verification link is clicked';

-- ════════════════════════════════════════════════════════════════════
--  TABLE 2 — user_favorites
--  Products saved by users
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_favorites (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_favorites_unique UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user    ON user_favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product ON user_favorites (product_id);

COMMENT ON TABLE user_favorites IS 'Products saved/bookmarked by portal users';

-- ════════════════════════════════════════════════════════════════════
--  TABLE 3 — user_notifications
--  In-app notification center per user
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_notifications (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(200) NOT NULL,
  message    TEXT         NOT NULL,
  type       VARCHAR(20)  NOT NULL DEFAULT 'info'
                          CONSTRAINT notifications_type_check
                          CHECK (type IN ('info','success','warning','inquiry','quotation')),
  is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
  link       VARCHAR(255),             -- Optional frontend route e.g. /user/inquiries
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notif_user   ON user_notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_user_notif_unread ON user_notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_notif_date   ON user_notifications (created_at DESC);

COMMENT ON TABLE user_notifications IS 'In-app notifications sent to portal users by admins or the system';

-- ════════════════════════════════════════════════════════════════════
--  ALTER — inquiries: add user_id FK (nullable for guest submissions)
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inquiries_user ON inquiries (user_id);

COMMENT ON COLUMN inquiries.user_id IS 'Set when inquiry submitted by a logged-in portal user';

-- ════════════════════════════════════════════════════════════════════
--  ALTER — quotations: add user_id FK (nullable)
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quotations_user ON quotations (user_id);

COMMENT ON COLUMN quotations.user_id IS 'Linked portal user account for self-service quotation tracking';

-- ════════════════════════════════════════════════════════════════════
--  TRIGGER — auto-update users.updated_at
-- ════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ════════════════════════════════════════════════════════════════════
--  MIGRATION COMPLETE
--  New tables:   users, user_favorites, user_notifications
--  Altered:      inquiries (user_id), quotations (user_id)
--  Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE
-- ════════════════════════════════════════════════════════════════════
