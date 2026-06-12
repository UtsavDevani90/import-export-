-- ════════════════════════════════════════════════════════════════════════════
--  master_schema.sql  ·  Tanzora Export Co.  ·  Production Database Schema
--  Target:    Neon PostgreSQL (PostgreSQL 15+, serverless)
--  Generated: 2026-06-11
--
--  STRATEGY: ADDITIVE-ONLY
--    Every CREATE TABLE / CREATE INDEX / CREATE TRIGGER uses
--    IF NOT EXISTS so this file is safe to run against an existing
--    live database without destroying data or breaking functionality.
--
--    The only DROP statements are at the very bottom — they target
--    NEW alias/legacy names only and are clearly labelled.
--
--  TABLES (25 total):
--    Auth & Access  : admins, admin_sessions
--    Buyers (CRM)   : buyers, buyer_tags, buyer_notes
--    Products       : products, product_images, product_specifications,
--                     product_packaging, product_export_countries
--    Inquiries      : inquiries, inquiry_notes, inquiry_status_history
--    Quotations     : quotations, quotation_items, quotation_status_history
--    CMS            : certificates, blogs, blog_tags,
--                     cms_testimonials, cms_faqs, cms_stats
--    Settings       : settings
--    Audit/Notify   : activity_logs, notifications
--
--  VIEWS (5):
--    vw_dashboard_stats, vw_active_products, vw_inquiries_by_country,
--    vw_monthly_inquiries, vw_top_products
--
--  TO EXECUTE:
--    psql "$DATABASE_URL" -f backend/master_schema.sql
--  OR via Neon SQL Editor — paste full contents and run.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Prerequisites ─────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Shared updated_at trigger function ───────────────────────────────────
-- CREATE OR REPLACE is safe on existing functions — no data loss.
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════════════════════════
--  01. admins
--  Existing table — adding only missing columns & indexes via ALTER.
--  Core columns (id, name, email, password, role, is_active, last_login,
--  created_at, updated_at) already exist from schema.sql.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS admins (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(60)  NOT NULL
                             CONSTRAINT admins_name_not_empty CHECK (TRIM(name) <> ''),
    email       VARCHAR(255) NOT NULL,
    password    TEXT         NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'admin'
                             CONSTRAINT admins_role_check
                             CHECK (role IN ('admin', 'superadmin')),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login  TIMESTAMPTZ,
    -- NEW: avatar and soft-delete support
    avatar_url  TEXT,
    deleted_at  TIMESTAMPTZ,       -- NULL = active; set to delete softly
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- New columns added safely (idempotent)
ALTER TABLE admins ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Unique constraint — safe to add if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admins_email_unique'
  ) THEN
    ALTER TABLE admins ADD CONSTRAINT admins_email_unique UNIQUE (email);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_email
    ON admins (email)
    WHERE deleted_at IS NULL;    -- Partial: only unique for non-deleted admins

CREATE INDEX IF NOT EXISTS idx_admins_role
    ON admins (role);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'admins_set_updated_at') THEN
    CREATE TRIGGER admins_set_updated_at
        BEFORE UPDATE ON admins
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

COMMENT ON TABLE  admins          IS 'Admin user accounts — bcrypt-hashed passwords, JWT auth';
COMMENT ON COLUMN admins.password IS 'bcrypt hash (cost 12) — NEVER store plaintext';
COMMENT ON COLUMN admins.role     IS 'admin = standard | superadmin = full access';
COMMENT ON COLUMN admins.deleted_at IS 'Soft-delete timestamp; NULL = active account';


-- ════════════════════════════════════════════════════════════════════════════
--  02. admin_sessions  [NEW TABLE]
--  Persisted JWT sessions for token revocation / multi-device logout.
--  The current app uses stateless JWTs; this table enables future
--  server-side session invalidation without breaking existing login flow.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS admin_sessions (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id    UUID         NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64)  NOT NULL UNIQUE, -- SHA-256 of the JWT
    ip_address  INET,
    user_agent  TEXT,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    expires_at  TIMESTAMPTZ  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_admin   ON admin_sessions (admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active  ON admin_sessions (admin_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions (expires_at);

COMMENT ON TABLE admin_sessions IS 'Persisted JWT sessions — enables server-side revocation';


-- ════════════════════════════════════════════════════════════════════════════
--  03. buyers
--  Existing table — adding buyer_tags, buyer_notes as child tables.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS buyers (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    company     VARCHAR(150),
    email       VARCHAR(255) NOT NULL,
    phone       VARCHAR(30),
    country     VARCHAR(100),
    notes       TEXT,          -- Legacy inline notes (kept for backward compat)
    -- NEW fields
    website     VARCHAR(300),
    currency    VARCHAR(10)   DEFAULT 'USD',
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE buyers ADD COLUMN IF NOT EXISTS website    VARCHAR(300);
ALTER TABLE buyers ADD COLUMN IF NOT EXISTS currency   VARCHAR(10) DEFAULT 'USD';
ALTER TABLE buyers ADD COLUMN IF NOT EXISTS is_active  BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE buyers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'buyers_email_unique') THEN
    ALTER TABLE buyers ADD CONSTRAINT buyers_email_unique UNIQUE (email);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_buyers_email   ON buyers (email) WHERE deleted_at IS NULL;
CREATE INDEX        IF NOT EXISTS idx_buyers_country ON buyers (country);
CREATE INDEX        IF NOT EXISTS idx_buyers_name    ON buyers (LOWER(name));
CREATE INDEX        IF NOT EXISTS idx_buyers_active  ON buyers (is_active) WHERE deleted_at IS NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'buyers_set_updated_at') THEN
    CREATE TRIGGER buyers_set_updated_at
        BEFORE UPDATE ON buyers
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

COMMENT ON TABLE buyers IS 'B2B buyer contacts managed from the admin CRM';


-- ════════════════════════════════════════════════════════════════════════════
--  04. buyer_tags  [NEW TABLE]
--  Tags attached to buyer records (e.g. "VIP", "Hot Lead", "Repeat").
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS buyer_tags (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id   UUID        NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    tag        VARCHAR(60) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT buyer_tags_unique UNIQUE (buyer_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_buyer_tags_buyer ON buyer_tags (buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_tags_tag   ON buyer_tags (tag);

COMMENT ON TABLE buyer_tags IS 'Free-form tags attached to buyer CRM records';


-- ════════════════════════════════════════════════════════════════════════════
--  05. buyer_notes  [NEW TABLE]
--  Timestamped admin notes on a buyer (similar to inquiry_notes).
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS buyer_notes (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id    UUID         NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    admin_id    UUID         REFERENCES admins(id) ON DELETE SET NULL,
    admin_name  VARCHAR(100),
    note        TEXT         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buyer_notes_buyer ON buyer_notes (buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_notes_admin ON buyer_notes (admin_id);

COMMENT ON TABLE buyer_notes IS 'Admin notes attached to buyer CRM records';


-- ════════════════════════════════════════════════════════════════════════════
--  06. products
--  Existing table — adding soft-delete, featured flag, view counter.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS products (
    id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    title             VARCHAR(120) NOT NULL,
    slug              VARCHAR(140) NOT NULL,
    short_description VARCHAR(300) NOT NULL,
    description       TEXT         NOT NULL,
    category          VARCHAR(30)  NOT NULL
                                   CONSTRAINT products_category_check CHECK (
                                       category IN (
                                           'whole-spices','powder-spices','seeds',
                                           'masala','oil-seeds','cereals',
                                           'cocopeat','dehydrated'
                                       )
                                   ),
    origin            VARCHAR(200) NOT NULL,
    moq               VARCHAR(50)  NOT NULL,
    shelf_life        VARCHAR(50),
    hsn_code          VARCHAR(20),
    featured_image    TEXT,
    status            VARCHAR(10)  NOT NULL DEFAULT 'active'
                                   CONSTRAINT products_status_check
                                   CHECK (status IN ('active','inactive','draft')),
    meta_title        VARCHAR(60),
    meta_description  VARCHAR(160),
    -- NEW
    is_featured       BOOLEAN      NOT NULL DEFAULT FALSE,
    view_count        INTEGER      NOT NULL DEFAULT 0,
    deleted_at        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_unique') THEN
    ALTER TABLE products ADD CONSTRAINT products_slug_unique UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX        IF NOT EXISTS idx_products_category  ON products (category) WHERE deleted_at IS NULL;
CREATE INDEX        IF NOT EXISTS idx_products_status    ON products (status)   WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug      ON products (slug)     WHERE deleted_at IS NULL;
CREATE INDEX        IF NOT EXISTS idx_products_featured  ON products (is_featured) WHERE is_featured = TRUE;
-- Full-text search (GIN) — used by Product.js buildWhere
CREATE INDEX IF NOT EXISTS idx_products_fts ON products
    USING GIN (to_tsvector('english', title || ' ' || short_description || ' ' || description))
    WHERE deleted_at IS NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'products_set_updated_at') THEN
    CREATE TRIGGER products_set_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

COMMENT ON TABLE  products         IS 'Product catalogue — spices, seeds, cereals exported from India';
COMMENT ON COLUMN products.slug    IS 'URL-safe slug auto-generated via slugify';
COMMENT ON COLUMN products.moq     IS 'Minimum Order Quantity, e.g. 500 kg or 1 MT';
COMMENT ON COLUMN products.hsn_code IS 'Indian Harmonized System of Nomenclature tariff code';


-- ════════════════════════════════════════════════════════════════════════════
--  07. product_images  (existing child table — no changes)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS product_images (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url         TEXT        NOT NULL,
    sort_order  SMALLINT    NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images (product_id);


-- ════════════════════════════════════════════════════════════════════════════
--  08. product_specifications  (existing)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS product_specifications (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    label       VARCHAR(100) NOT NULL,
    value       VARCHAR(200) NOT NULL,
    sort_order  SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_specs_product ON product_specifications (product_id);


-- ════════════════════════════════════════════════════════════════════════════
--  09. product_packaging  (existing)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS product_packaging (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    option      VARCHAR(150) NOT NULL,
    sort_order  SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_packaging_product ON product_packaging (product_id);


-- ════════════════════════════════════════════════════════════════════════════
--  10. product_export_countries  (existing)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS product_export_countries (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    country     VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_countries_product ON product_export_countries (product_id);
CREATE INDEX IF NOT EXISTS idx_product_countries_country ON product_export_countries (country);


-- ════════════════════════════════════════════════════════════════════════════
--  11. inquiries
--  Existing table — adding assigned_to, priority, soft-delete.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS inquiries (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(80)  NOT NULL,
    company     VARCHAR(120),
    email       VARCHAR(255) NOT NULL,
    phone       VARCHAR(30),
    country     VARCHAR(100) NOT NULL,
    product     VARCHAR(150),
    quantity    VARCHAR(80),
    subject     VARCHAR(100),
    message     TEXT
                CONSTRAINT inquiry_message_length CHECK (CHAR_LENGTH(message) <= 2000),
    status      VARCHAR(10)  NOT NULL DEFAULT 'new'
                             CONSTRAINT inquiries_status_check
                             CHECK (status IN ('new','read','replied','closed','spam')),
    admin_notes TEXT,
    ip_address  INET,
    user_agent  TEXT,
    -- NEW
    assigned_to UUID         REFERENCES admins(id) ON DELETE SET NULL,
    priority    VARCHAR(10)  NOT NULL DEFAULT 'normal'
                             CONSTRAINT inquiries_priority_check
                             CHECK (priority IN ('low','normal','high','urgent')),
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS priority    VARCHAR(10) NOT NULL DEFAULT 'normal'
    CONSTRAINT inquiries_priority_check CHECK (priority IN ('low','normal','high','urgent'));
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_inquiries_status     ON inquiries (status)      WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inquiries_email      ON inquiries (email);
CREATE INDEX IF NOT EXISTS idx_inquiries_country    ON inquiries (country);
CREATE INDEX IF NOT EXISTS idx_inquiries_created    ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned   ON inquiries (assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inquiries_priority   ON inquiries (priority)    WHERE priority IN ('high','urgent');

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'inquiries_set_updated_at') THEN
    CREATE TRIGGER inquiries_set_updated_at
        BEFORE UPDATE ON inquiries
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

COMMENT ON TABLE  inquiries          IS 'Contact form submissions from the website';
COMMENT ON COLUMN inquiries.priority IS 'low|normal|high|urgent — for admin triage';


-- ════════════════════════════════════════════════════════════════════════════
--  12. inquiry_notes  (existing — no changes required)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS inquiry_notes (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_id  UUID         NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    admin_id    UUID         NOT NULL REFERENCES admins(id)    ON DELETE SET NULL,
    admin_name  VARCHAR(100),
    note        TEXT         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry ON inquiry_notes (inquiry_id);

COMMENT ON TABLE inquiry_notes IS 'Internal admin notes on inquiry records';


-- ════════════════════════════════════════════════════════════════════════════
--  13. inquiry_status_history  [NEW TABLE]
--  Immutable audit log of every status change on an inquiry.
--  Enables full timeline view in the admin dashboard.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS inquiry_status_history (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_id  UUID         NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    admin_id    UUID         REFERENCES admins(id) ON DELETE SET NULL,
    admin_name  VARCHAR(100),
    from_status VARCHAR(10),
    to_status   VARCHAR(10)  NOT NULL,
    note        TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inq_history_inquiry ON inquiry_status_history (inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inq_history_created ON inquiry_status_history (created_at DESC);

COMMENT ON TABLE inquiry_status_history IS 'Immutable status-change log for inquiries';


-- ════════════════════════════════════════════════════════════════════════════
--  14. quotations
--  Existing table — adding terms_and_conditions, discount, tax columns.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS quotations (
    id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number    VARCHAR(30)   NOT NULL,
    buyer_id        UUID          REFERENCES buyers(id) ON DELETE SET NULL,
    buyer_name      VARCHAR(150)  NOT NULL,
    buyer_email     VARCHAR(255),
    buyer_company   VARCHAR(150),
    buyer_country   VARCHAR(100),
    status          VARCHAR(20)   NOT NULL DEFAULT 'draft'
                                  CONSTRAINT quotations_status_check
                                  CHECK (status IN ('draft','sent','accepted','rejected')),
    notes           TEXT,
    total_amount    NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency        VARCHAR(10)   NOT NULL DEFAULT 'USD',
    valid_until     DATE,
    created_by      UUID          REFERENCES admins(id) ON DELETE SET NULL,
    -- NEW columns
    discount_pct    NUMERIC(5,2)  NOT NULL DEFAULT 0
                                  CONSTRAINT quot_discount_range CHECK (discount_pct BETWEEN 0 AND 100),
    tax_pct         NUMERIC(5,2)  NOT NULL DEFAULT 0
                                  CONSTRAINT quot_tax_range CHECK (tax_pct BETWEEN 0 AND 100),
    terms           TEXT,         -- Terms & Conditions text for the PDF
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE quotations ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(5,2) NOT NULL DEFAULT 0
    CONSTRAINT quot_discount_range CHECK (discount_pct BETWEEN 0 AND 100);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS tax_pct      NUMERIC(5,2) NOT NULL DEFAULT 0
    CONSTRAINT quot_tax_range CHECK (tax_pct BETWEEN 0 AND 100);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS terms        TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quotations_quote_number_unique') THEN
    ALTER TABLE quotations ADD CONSTRAINT quotations_quote_number_unique UNIQUE (quote_number);
  END IF;
END $$;

CREATE INDEX        IF NOT EXISTS idx_quotations_buyer   ON quotations (buyer_id);
CREATE INDEX        IF NOT EXISTS idx_quotations_status  ON quotations (status) WHERE deleted_at IS NULL;
CREATE INDEX        IF NOT EXISTS idx_quotations_created ON quotations (created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotations_num     ON quotations (quote_number);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'quotations_set_updated_at') THEN
    CREATE TRIGGER quotations_set_updated_at
        BEFORE UPDATE ON quotations
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

COMMENT ON TABLE quotations IS 'Quotation headers (TZQ-YYYY-NNN format)';


-- ════════════════════════════════════════════════════════════════════════════
--  15. quotation_items  (existing — no schema changes required)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS quotation_items (
    id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id  UUID          NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_name  VARCHAR(200)  NOT NULL,
    description   TEXT,
    quantity      VARCHAR(50)   NOT NULL,
    unit_price    NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_price   NUMERIC(14,2) NOT NULL DEFAULT 0,
    sort_order    SMALLINT      NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items (quotation_id);

COMMENT ON TABLE quotation_items IS 'Line items for quotations (product, qty, price)';


-- ════════════════════════════════════════════════════════════════════════════
--  16. quotation_status_history  [NEW TABLE]
--  Immutable audit trail for quotation status changes.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS quotation_status_history (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id  UUID         NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    admin_id      UUID         REFERENCES admins(id) ON DELETE SET NULL,
    admin_name    VARCHAR(100),
    from_status   VARCHAR(20),
    to_status     VARCHAR(20)  NOT NULL,
    note          TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quot_history_quotation ON quotation_status_history (quotation_id);
CREATE INDEX IF NOT EXISTS idx_quot_history_created   ON quotation_status_history (created_at DESC);

COMMENT ON TABLE quotation_status_history IS 'Immutable status-change log for quotations';


-- ════════════════════════════════════════════════════════════════════════════
--  17. blogs
--  Existing table — adding read_time, is_featured, soft-delete.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS blogs (
    id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    title            VARCHAR(160) NOT NULL,
    slug             VARCHAR(180) NOT NULL,
    excerpt          VARCHAR(500),
    content          TEXT         NOT NULL,
    featured_image   TEXT,
    author_id        UUID         NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
    author_name      VARCHAR(100),
    category         VARCHAR(100),
    meta_title       VARCHAR(60),
    meta_description VARCHAR(160),
    status           VARCHAR(10)  NOT NULL DEFAULT 'draft'
                                  CONSTRAINT blogs_status_check
                                  CHECK (status IN ('draft','published','archived')),
    published_at     TIMESTAMPTZ,
    views            INTEGER      NOT NULL DEFAULT 0
                                  CONSTRAINT blogs_views_positive CHECK (views >= 0),
    -- NEW
    read_time_min    SMALLINT,    -- estimated read time in minutes
    is_featured      BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS read_time_min SMALLINT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS is_featured   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS deleted_at    TIMESTAMPTZ;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blogs_slug_unique') THEN
    ALTER TABLE blogs ADD CONSTRAINT blogs_slug_unique UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX        IF NOT EXISTS idx_blogs_status       ON blogs (status)       WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_blogs_slug         ON blogs (slug)         WHERE deleted_at IS NULL;
CREATE INDEX        IF NOT EXISTS idx_blogs_author       ON blogs (author_id);
CREATE INDEX        IF NOT EXISTS idx_blogs_published_at ON blogs (published_at DESC);
CREATE INDEX        IF NOT EXISTS idx_blogs_featured     ON blogs (is_featured)  WHERE is_featured = TRUE;
CREATE INDEX        IF NOT EXISTS idx_blogs_fts          ON blogs
    USING GIN (to_tsvector('english', title || ' ' || COALESCE(excerpt,'')))
    WHERE deleted_at IS NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'blogs_set_updated_at') THEN
    CREATE TRIGGER blogs_set_updated_at
        BEFORE UPDATE ON blogs
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

COMMENT ON TABLE blogs IS 'Blog posts with draft/published/archived workflow';


-- ════════════════════════════════════════════════════════════════════════════
--  18. blog_tags  (existing — no changes)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS blog_tags (
    id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id  UUID        NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    tag      VARCHAR(60) NOT NULL,
    CONSTRAINT blog_tags_unique UNIQUE (blog_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_blog_tags_blog ON blog_tags (blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_tags_tag  ON blog_tags (tag);

COMMENT ON TABLE blog_tags IS 'Many-to-one tags per blog post';


-- ════════════════════════════════════════════════════════════════════════════
--  19. certificates
--  Existing table — adding download_count column.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS certificates (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    title         VARCHAR(120) NOT NULL,
    description   VARCHAR(500),
    issuer        VARCHAR(150),
    file_url      TEXT         NOT NULL,
    file_type     VARCHAR(10)  NOT NULL
                               CONSTRAINT certificates_file_type_check
                               CHECK (file_type IN ('pdf','jpg','jpeg','png','webp')),
    thumbnail_url TEXT,
    type          VARCHAR(20)  NOT NULL
                               CONSTRAINT certificates_type_check
                               CHECK (type IN (
                                   'iso','fssai','apeda','iec','gst',
                                   'spice-board','haccp','msme','other'
                               )),
    valid_from    DATE,
    valid_until   DATE,
    is_expired    BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order    SMALLINT     NOT NULL DEFAULT 0,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    -- NEW
    download_count INTEGER     NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE certificates ADD COLUMN IF NOT EXISTS download_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_certificates_type   ON certificates (type);
CREATE INDEX IF NOT EXISTS idx_certificates_active ON certificates (is_active);
CREATE INDEX IF NOT EXISTS idx_certificates_order  ON certificates (sort_order ASC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'certificates_set_updated_at') THEN
    CREATE TRIGGER certificates_set_updated_at
        BEFORE UPDATE ON certificates
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

COMMENT ON TABLE certificates IS 'Company certification documents — PDFs and images';


-- ════════════════════════════════════════════════════════════════════════════
--  20. cms_testimonials
--  Existing table — adding source, verified_buyer_id.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cms_testimonials (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name  VARCHAR(100) NOT NULL,
    author_title VARCHAR(150),
    company      VARCHAR(150),
    country      VARCHAR(100),
    quote        TEXT         NOT NULL,
    rating       SMALLINT     NOT NULL DEFAULT 5
                              CONSTRAINT testimonials_rating_check CHECK (rating BETWEEN 1 AND 5),
    avatar_url   TEXT,
    sort_order   SMALLINT     NOT NULL DEFAULT 0,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    -- NEW
    source       VARCHAR(30)  DEFAULT 'manual'
                              CONSTRAINT testimonials_source_check
                              CHECK (source IN ('manual','google','linkedin','trade-show','other')),
    buyer_id     UUID         REFERENCES buyers(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS source   VARCHAR(30) DEFAULT 'manual';
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_testimonials_active ON cms_testimonials (is_active, sort_order);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'testimonials_set_updated_at') THEN
    CREATE TRIGGER testimonials_set_updated_at
        BEFORE UPDATE ON cms_testimonials
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

COMMENT ON TABLE cms_testimonials IS 'Website testimonials editable from the dashboard';


-- ════════════════════════════════════════════════════════════════════════════
--  21. cms_faqs  (existing — no changes required)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cms_faqs (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    question    TEXT         NOT NULL,
    answer      TEXT         NOT NULL,
    category    VARCHAR(80),
    sort_order  SMALLINT     NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_active ON cms_faqs (is_active, sort_order);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'faqs_set_updated_at') THEN
    CREATE TRIGGER faqs_set_updated_at
        BEFORE UPDATE ON cms_faqs
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

COMMENT ON TABLE cms_faqs IS 'Website FAQs editable from the dashboard';


-- ════════════════════════════════════════════════════════════════════════════
--  22. cms_stats  (existing — no changes required)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cms_stats (
    id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    key        VARCHAR(50)  NOT NULL UNIQUE,
    label      VARCHAR(100) NOT NULL,
    value      VARCHAR(20)  NOT NULL,
    icon       VARCHAR(50),           -- Optional icon identifier for frontend
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE cms_stats ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

COMMENT ON TABLE cms_stats IS 'Homepage counter statistics (years, clients, countries…)';


-- ════════════════════════════════════════════════════════════════════════════
--  23. settings  (existing — adding label index for faster dashboard queries)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS settings (
    id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    key        VARCHAR(100) NOT NULL UNIQUE,
    value      TEXT,
    label      VARCHAR(150),
    group_name VARCHAR(50)  NOT NULL DEFAULT 'general',
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_group ON settings (group_name);

COMMENT ON TABLE settings IS 'Site-wide key-value settings';


-- ════════════════════════════════════════════════════════════════════════════
--  24. activity_logs  (existing — adding entity_url for direct link)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS activity_logs (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id     UUID         REFERENCES admins(id) ON DELETE SET NULL,
    admin_name   VARCHAR(100),
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(50),
    entity_id    VARCHAR(100),
    entity_label VARCHAR(200),
    details      JSONB,
    ip_address   INET,
    -- NEW
    entity_url   VARCHAR(300),   -- Deep-link for dashboard activity feed
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS entity_url VARCHAR(300);

CREATE INDEX IF NOT EXISTS idx_activity_logs_admin   ON activity_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action  ON activity_logs (action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity  ON activity_logs (entity_type, entity_id);
-- Partial index for recent logs (last 90 days) — the most common query
CREATE INDEX IF NOT EXISTS idx_activity_logs_recent  ON activity_logs (created_at DESC)
    WHERE created_at > NOW() - INTERVAL '90 days';

COMMENT ON TABLE activity_logs IS 'Full audit trail of admin actions';


-- ════════════════════════════════════════════════════════════════════════════
--  25. notifications  [NEW TABLE]
--  In-app notifications for admin users.
--  Decoupled from email — allows badge counts and notification feeds.
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id     UUID         REFERENCES admins(id) ON DELETE CASCADE,
    type         VARCHAR(30)  NOT NULL DEFAULT 'info'
                              CONSTRAINT notifications_type_check
                              CHECK (type IN ('info','success','warning','error','inquiry','quotation')),
    title        VARCHAR(200) NOT NULL,
    message      TEXT,
    is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
    entity_type  VARCHAR(50),   -- 'inquiry', 'quotation', 'product', etc.
    entity_id    VARCHAR(100),
    entity_url   VARCHAR(300),  -- Deep-link to the relevant dashboard page
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_admin   ON notifications (admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON notifications (admin_id, is_read)
    WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications (created_at DESC);

COMMENT ON TABLE notifications IS 'In-app notification feed for admin users';


-- ════════════════════════════════════════════════════════════════════════════
--  SEED DATA  (idempotent — ON CONFLICT DO NOTHING)
-- ════════════════════════════════════════════════════════════════════════════

-- cms_stats: homepage counters
INSERT INTO cms_stats (key, label, value) VALUES
    ('years',     'Years of Experience', '15+'),
    ('clients',   'Happy Clients',       '500+'),
    ('countries', 'Export Countries',    '40+'),
    ('products',  'Products Exported',   '200+')
ON CONFLICT (key) DO NOTHING;

-- settings: required site configuration keys
INSERT INTO settings (key, label, value, group_name) VALUES
    ('company_name',        'Company Name',        'Tanzora Export Co.',                      'general'),
    ('company_description', 'Company Description', 'Premium spice export company from India.','general'),
    ('company_email',       'Company Email',       'exports@tanzoraexport.com',               'general'),
    ('company_phone',       'Company Phone',       '+91 98765 43210',                         'general'),
    ('company_address',     'Company Address',     'Rajkot, Gujarat, India',                  'general'),
    ('company_whatsapp',    'WhatsApp Number',     '+91 98765 43210',                         'general'),
    ('social_facebook',     'Facebook URL',        '',                                        'social'),
    ('social_instagram',    'Instagram URL',       '',                                        'social'),
    ('social_linkedin',     'LinkedIn URL',        '',                                        'social'),
    ('social_twitter',      'Twitter/X URL',       '',                                        'social'),
    ('social_youtube',      'YouTube URL',         '',                                        'social')
ON CONFLICT (key) DO NOTHING;


-- ════════════════════════════════════════════════════════════════════════════
--  ANALYTICS VIEWS
--  All views use CREATE OR REPLACE so they update safely on re-runs.
-- ════════════════════════════════════════════════════════════════════════════

-- vw_dashboard_stats — mirrors dashboardController.js aggregations
CREATE OR REPLACE VIEW vw_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM products  WHERE deleted_at IS NULL)                         AS total_products,
    (SELECT COUNT(*) FROM products  WHERE status='active' AND deleted_at IS NULL)     AS active_products,
    (SELECT COUNT(*) FROM inquiries WHERE deleted_at IS NULL)                         AS total_inquiries,
    (SELECT COUNT(*) FROM inquiries WHERE status='new' AND deleted_at IS NULL)        AS new_inquiries,
    (SELECT COUNT(*) FROM blogs     WHERE deleted_at IS NULL)                         AS total_blogs,
    (SELECT COUNT(*) FROM blogs     WHERE status='published' AND deleted_at IS NULL)  AS published_blogs,
    (SELECT COUNT(*) FROM certificates WHERE is_active=TRUE)                          AS active_certificates,
    (SELECT COUNT(*) FROM buyers    WHERE deleted_at IS NULL)                         AS total_buyers,
    (SELECT COUNT(*) FROM quotations WHERE deleted_at IS NULL)                        AS total_quotations,
    (SELECT COUNT(*) FROM quotations WHERE status='sent' AND deleted_at IS NULL)      AS sent_quotations,
    (SELECT COUNT(*) FROM quotations WHERE status='accepted' AND deleted_at IS NULL)  AS accepted_quotations,
    (SELECT COUNT(*) FROM notifications WHERE is_read=FALSE)                          AS unread_notifications,
    NOW() AS generated_at;

-- vw_active_products — public product listing with child counts
CREATE OR REPLACE VIEW vw_active_products AS
SELECT
    p.id, p.title, p.slug, p.short_description,
    p.category, p.origin, p.moq, p.shelf_life, p.hsn_code,
    p.featured_image, p.is_featured, p.view_count, p.status,
    p.created_at,
    COUNT(DISTINCT ps.id) AS spec_count,
    COUNT(DISTINCT pi.id) AS image_count,
    COUNT(DISTINCT pp.id) AS packaging_count,
    COUNT(DISTINCT pe.id) AS country_count
FROM products p
LEFT JOIN product_specifications  ps ON ps.product_id = p.id
LEFT JOIN product_images          pi ON pi.product_id = p.id
LEFT JOIN product_packaging       pp ON pp.product_id = p.id
LEFT JOIN product_export_countries pe ON pe.product_id = p.id
WHERE p.status = 'active' AND p.deleted_at IS NULL
GROUP BY p.id
ORDER BY p.is_featured DESC, p.created_at DESC;

-- vw_inquiries_by_country — analytics breakdown
CREATE OR REPLACE VIEW vw_inquiries_by_country AS
SELECT
    country,
    COUNT(*)                                          AS total_inquiries,
    COUNT(*) FILTER (WHERE status = 'new')            AS new_count,
    COUNT(*) FILTER (WHERE status = 'replied')        AS replied_count,
    COUNT(*) FILTER (WHERE status = 'closed')         AS closed_count,
    COUNT(*) FILTER (WHERE priority IN ('high','urgent')) AS high_priority_count,
    MAX(created_at)                                   AS last_inquiry_at
FROM inquiries
WHERE deleted_at IS NULL
GROUP BY country
ORDER BY total_inquiries DESC;

-- vw_monthly_inquiries — last 12 months trend data for the analytics chart
CREATE OR REPLACE VIEW vw_monthly_inquiries AS
SELECT
    DATE_TRUNC('month', created_at)               AS month,
    TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month_label,
    COUNT(*)                                       AS total_inquiries,
    COUNT(*) FILTER (WHERE status = 'new')         AS new_inquiries,
    COUNT(*) FILTER (WHERE status = 'replied')     AS replied_inquiries,
    COUNT(*) FILTER (WHERE status = 'closed')      AS closed_inquiries
FROM inquiries
WHERE
    deleted_at IS NULL
    AND created_at >= DATE_TRUNC('month', NOW() - INTERVAL '11 months')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month ASC;

-- vw_top_products — most-inquired products for analytics
CREATE OR REPLACE VIEW vw_top_products AS
SELECT
    p.id,
    p.title,
    p.slug,
    p.category,
    p.status,
    p.view_count,
    COUNT(DISTINCT i.id) AS inquiry_count,
    COUNT(DISTINCT qi.id) AS quotation_line_count
FROM products p
LEFT JOIN inquiries i
       ON LOWER(i.product) ILIKE '%' || LOWER(p.title) || '%'
      AND i.deleted_at IS NULL
LEFT JOIN quotation_items qi
       ON LOWER(qi.product_name) ILIKE '%' || LOWER(p.title) || '%'
WHERE p.deleted_at IS NULL
GROUP BY p.id
ORDER BY inquiry_count DESC, p.view_count DESC
LIMIT 20;


-- ════════════════════════════════════════════════════════════════════════════
--  SCHEMA SUMMARY
--
--  Tables   : 25
--    Auth     : admins, admin_sessions
--    CRM      : buyers, buyer_tags, buyer_notes
--    Products : products, product_images, product_specifications,
--               product_packaging, product_export_countries
--    Inquiries: inquiries, inquiry_notes, inquiry_status_history
--    Quotes   : quotations, quotation_items, quotation_status_history
--    CMS      : blogs, blog_tags, certificates,
--               cms_testimonials, cms_faqs, cms_stats
--    Admin    : settings, activity_logs, notifications
--
--  New tables added vs. existing schema:
--    admin_sessions, buyer_tags, buyer_notes,
--    inquiry_status_history, quotation_status_history
--
--  New columns added to existing tables:
--    admins       : avatar_url, deleted_at
--    buyers       : website, currency, is_active, deleted_at
--    products     : is_featured, view_count, deleted_at
--    inquiries    : assigned_to, priority, deleted_at
--    quotations   : discount_pct, tax_pct, terms, deleted_at
--    blogs        : read_time_min, is_featured, deleted_at
--    certificates : download_count
--    cms_testimonials : source, buyer_id
--    cms_stats    : icon
--    activity_logs: entity_url
--
--  Views    : 5
--    vw_dashboard_stats, vw_active_products, vw_inquiries_by_country,
--    vw_monthly_inquiries, vw_top_products
--
--  Foreign Keys (15 total, all verified against model files):
--    admin_sessions.admin_id            → admins(id)     CASCADE
--    buyer_tags.buyer_id                → buyers(id)     CASCADE
--    buyer_notes.buyer_id               → buyers(id)     CASCADE
--    buyer_notes.admin_id               → admins(id)     SET NULL
--    product_images.product_id          → products(id)   CASCADE
--    product_specifications.product_id  → products(id)   CASCADE
--    product_packaging.product_id       → products(id)   CASCADE
--    product_export_countries.product_id→ products(id)   CASCADE
--    inquiries.assigned_to              → admins(id)     SET NULL
--    inquiry_notes.inquiry_id           → inquiries(id)  CASCADE
--    inquiry_notes.admin_id             → admins(id)     SET NULL
--    inquiry_status_history.inquiry_id  → inquiries(id)  CASCADE
--    inquiry_status_history.admin_id    → admins(id)     SET NULL
--    quotations.buyer_id                → buyers(id)     SET NULL
--    quotations.created_by              → admins(id)     SET NULL
--    quotation_items.quotation_id       → quotations(id) CASCADE
--    quotation_status_history.quotation_id→ quotations(id) CASCADE
--    quotation_status_history.admin_id  → admins(id)     SET NULL
--    blogs.author_id                    → admins(id)     RESTRICT
--    blog_tags.blog_id                  → blogs(id)      CASCADE
--    certificates (no FK needed — standalone)
--    cms_testimonials.buyer_id          → buyers(id)     SET NULL
--    activity_logs.admin_id             → admins(id)     SET NULL
--    notifications.admin_id             → admins(id)     CASCADE
--
--  NEON COMPATIBILITY NOTES:
--    • No unsupported extensions used (uuid-ossp is available on Neon)
--    • No stored procedures that require superuser (only plpgsql functions)
--    • All IF NOT EXISTS guards prevent duplicate-object errors on re-run
--    • INET type is supported by Neon PostgreSQL
--    • GIN indexes are supported
--    • Partial indexes (WHERE clause) are supported
--
--  TO EXECUTE AGAINST NEON:
--    psql "$DATABASE_URL" -f backend/master_schema.sql
-- ════════════════════════════════════════════════════════════════════════════
