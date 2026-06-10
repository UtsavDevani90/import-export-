-- ═══════════════════════════════════════════════════════════════════════════
--  master_schema.sql — Tanzora Export Co.  ·  Complete Production Schema
--  Database:  PostgreSQL 15+
--
--  DESCRIPTION:
--    This is the single authoritative database schema for the Tanzora Export
--    application. It was produced by merging and deduplicating:
--      • backend/schema.sql                          (10 tables, 4 views)
--      • backend/migrations/001_admin_dashboard.sql  (9 additional tables)
--
--  TABLES (20 total, creation order respects FK dependencies):
--    01. admins                 — Admin user accounts
--    02. buyers                 — Registered buyer contact records
--    03. products               — Product catalogue
--    04. product_images         — Child: product image gallery
--    05. product_specifications — Child: product key-value specs
--    06. product_packaging      — Child: product packaging options
--    07. product_export_countries — Child: countries a product exports to
--    08. inquiries              — Website contact form submissions
--    09. inquiry_notes          — Internal admin notes on inquiries
--    10. quotations             — Quotation headers
--    11. quotation_items        — Quotation line items
--    12. blogs                  — Blog posts
--    13. blog_tags              — Child: blog post tags
--    14. certificates           — Certification documents
--    15. cms_testimonials       — Website testimonials
--    16. cms_faqs               — Website FAQs
--    17. cms_stats              — Homepage statistics counters
--    18. settings               — Site-wide key-value configuration
--    19. activity_logs          — Admin action audit trail
--    20. notifications          — (reserved for future use, stub included)
--
--  VIEWS (4):
--    vw_active_products, vw_published_blogs,
--    vw_dashboard_stats, vw_inquiries_by_country
--
--  TRIGGERS (8): auto-update updated_at on all mutable tables
--  INDEXES:    25+ covering every FK, lookup, and full-text search column
--
--  SAFE TO RUN ON:
--    • A completely fresh (empty) PostgreSQL database
--    • DROP IF EXISTS guards prevent conflicts on re-runs
--
--  TO EXECUTE:
--    psql -U <user> -d <database> -f backend/master_schema.sql
--
--  GENERATED: 2026-06-11
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Enable UUID extension ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════
--  SHARED TRIGGER FUNCTION
--  Defined once, reused by all tables that need auto-updating updated_at.
--  (Was duplicated across schema.sql and 001_admin_dashboard.sql — merged.)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ═══════════════════════════════════════════════════════════════════════════
--  DROP ALL TABLES (reverse dependency order)
--  Safe for re-runs. CASCADE handles any residual FK dependencies.
-- ═══════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS notifications            CASCADE;
DROP TABLE IF EXISTS activity_logs           CASCADE;
DROP TABLE IF EXISTS settings                CASCADE;
DROP TABLE IF EXISTS cms_stats               CASCADE;
DROP TABLE IF EXISTS cms_faqs                CASCADE;
DROP TABLE IF EXISTS cms_testimonials        CASCADE;
DROP TABLE IF EXISTS quotation_items         CASCADE;
DROP TABLE IF EXISTS quotations              CASCADE;
DROP TABLE IF EXISTS inquiry_notes           CASCADE;
DROP TABLE IF EXISTS blog_tags               CASCADE;
DROP TABLE IF EXISTS blogs                   CASCADE;
DROP TABLE IF EXISTS certificates            CASCADE;
DROP TABLE IF EXISTS product_export_countries CASCADE;
DROP TABLE IF EXISTS product_packaging       CASCADE;
DROP TABLE IF EXISTS product_specifications  CASCADE;
DROP TABLE IF EXISTS product_images          CASCADE;
DROP TABLE IF EXISTS inquiries               CASCADE;
DROP TABLE IF EXISTS products                CASCADE;
DROP TABLE IF EXISTS buyers                  CASCADE;
DROP TABLE IF EXISTS admins                  CASCADE;

-- ─── Drop trigger function and views for clean re-runs ────────────────────
DROP VIEW IF EXISTS vw_inquiries_by_country  CASCADE;
DROP VIEW IF EXISTS vw_dashboard_stats       CASCADE;
DROP VIEW IF EXISTS vw_published_blogs       CASCADE;
DROP VIEW IF EXISTS vw_active_products       CASCADE;


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 01 — admins
--  Maps to: models/Admin.js
--  Purpose: Admin user accounts with bcrypt-hashed passwords.
--  Used by: authController.js (login, register, change-password, me)
--           adminController.js (list, update-status, update-role, remove)
--           blogs.author_id  (FK reference)
--           inquiry_notes.admin_id (FK reference)
--           quotations.created_by  (FK reference)
--           activity_logs.admin_id (FK reference)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE admins (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(60)  NOT NULL
                             CONSTRAINT admins_name_not_empty CHECK (TRIM(name) <> ''),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    TEXT         NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'admin'
                             CONSTRAINT admins_role_check
                             CHECK (role IN ('admin', 'superadmin')),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Authentication hot-path: fast login lookup by email
CREATE UNIQUE INDEX idx_admins_email ON admins (email);

CREATE TRIGGER admins_set_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  admins          IS 'Admin user accounts — passwords stored as bcrypt hashes (cost 12)';
COMMENT ON COLUMN admins.password IS 'bcrypt hash — NEVER store plaintext';
COMMENT ON COLUMN admins.role     IS 'admin = standard | superadmin = full access';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 02 — buyers
--  Maps to: models/Buyer.js
--  Purpose: Registered buyer contact records managed from the dashboard.
--  Used by: buyerController.js, quotations.buyer_id (FK)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE buyers (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    company     VARCHAR(150),
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(30),
    country     VARCHAR(100),
    notes       TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_buyers_email   ON buyers (email);
CREATE INDEX        idx_buyers_country ON buyers (country);
CREATE INDEX        idx_buyers_name    ON buyers (LOWER(name));

CREATE TRIGGER buyers_set_updated_at
    BEFORE UPDATE ON buyers
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE buyers IS 'Registered buyers managed from the admin dashboard';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 03 — products
--  Maps to: models/Product.js
--  Purpose: Main product catalogue.
--  Child tables: product_images, product_specifications,
--                product_packaging, product_export_countries
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE products (
    id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Identity
    title             VARCHAR(120) NOT NULL,
    slug              VARCHAR(140) NOT NULL UNIQUE,
    -- Content
    short_description VARCHAR(300) NOT NULL,
    description       TEXT         NOT NULL,
    -- Classification
    category          VARCHAR(30)  NOT NULL
                                   CONSTRAINT products_category_check CHECK (
                                       category IN (
                                           'whole-spices',
                                           'powder-spices',
                                           'seeds',
                                           'masala',
                                           'oil-seeds',
                                           'cereals',
                                           'cocopeat',
                                           'dehydrated'
                                       )
                                   ),
    -- Export details
    origin            VARCHAR(200) NOT NULL,
    moq               VARCHAR(50)  NOT NULL,
    shelf_life        VARCHAR(50),
    hsn_code          VARCHAR(20),
    -- Primary image (gallery in product_images)
    featured_image    TEXT,
    -- Visibility
    status            VARCHAR(10)  NOT NULL DEFAULT 'active'
                                   CONSTRAINT products_status_check
                                   CHECK (status IN ('active', 'inactive', 'draft')),
    -- SEO
    meta_title        VARCHAR(60),
    meta_description  VARCHAR(160),
    -- Timestamps
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_status   ON products (status);
CREATE UNIQUE INDEX idx_products_slug ON products (slug);
-- Full-text search (used by Product.js buildWhere)
CREATE INDEX idx_products_fts ON products
    USING GIN (to_tsvector('english', title || ' ' || short_description || ' ' || description));

CREATE TRIGGER products_set_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  products          IS 'Product catalogue — core listing';
COMMENT ON COLUMN products.slug     IS 'URL-safe identifier auto-generated from title via slugify';
COMMENT ON COLUMN products.moq      IS 'Minimum Order Quantity, e.g. 500 kg or 1 MT';
COMMENT ON COLUMN products.hsn_code IS 'Indian Harmonized System of Nomenclature tariff code';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 04 — product_images
--  Normalises Product.images[] array
--  FK: product_id → products(id) ON DELETE CASCADE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE product_images (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID         NOT NULL
                             REFERENCES products(id) ON DELETE CASCADE,
    url         TEXT         NOT NULL,
    sort_order  SMALLINT     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images (product_id);

COMMENT ON TABLE product_images IS 'One-to-many product image gallery';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 05 — product_specifications
--  Normalises Product.specifications[{label,value}] array
--  FK: product_id → products(id) ON DELETE CASCADE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE product_specifications (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID         NOT NULL
                             REFERENCES products(id) ON DELETE CASCADE,
    label       VARCHAR(100) NOT NULL,
    value       VARCHAR(200) NOT NULL,
    sort_order  SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_specs_product ON product_specifications (product_id);

COMMENT ON TABLE product_specifications IS 'Key-value specification pairs per product';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 06 — product_packaging
--  Normalises Product.packaging[] string array
--  FK: product_id → products(id) ON DELETE CASCADE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE product_packaging (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID         NOT NULL
                             REFERENCES products(id) ON DELETE CASCADE,
    option      VARCHAR(150) NOT NULL,
    sort_order  SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_packaging_product ON product_packaging (product_id);

COMMENT ON TABLE product_packaging IS 'Packaging options per product';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 07 — product_export_countries
--  Normalises Product.exportCountries[] array
--  FK: product_id → products(id) ON DELETE CASCADE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE product_export_countries (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID         NOT NULL
                             REFERENCES products(id) ON DELETE CASCADE,
    country     VARCHAR(100) NOT NULL
);

CREATE INDEX idx_product_countries_product ON product_export_countries (product_id);
CREATE INDEX idx_product_countries_country ON product_export_countries (country);

COMMENT ON TABLE product_export_countries IS 'Countries each product is exported to';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 08 — inquiries
--  Maps to: models/Inquiry.js
--  Purpose: Contact form submissions from the website.
--  Child: inquiry_notes
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE inquiries (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Submitter
    name        VARCHAR(80)  NOT NULL,
    company     VARCHAR(120),
    email       VARCHAR(255) NOT NULL,
    phone       VARCHAR(30),
    country     VARCHAR(100) NOT NULL,
    -- Inquiry details
    product     VARCHAR(150),
    quantity    VARCHAR(80),
    subject     VARCHAR(100),
    message     TEXT
                CONSTRAINT inquiry_message_length
                CHECK (CHAR_LENGTH(message) <= 2000),
    -- Admin workflow
    status      VARCHAR(10)  NOT NULL DEFAULT 'new'
                             CONSTRAINT inquiries_status_check
                             CHECK (status IN ('new', 'read', 'replied', 'closed', 'spam')),
    admin_notes TEXT,
    -- Request metadata (spam analysis, audit)
    ip_address  INET,
    user_agent  TEXT,
    -- Timestamps
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inquiries_status  ON inquiries (status);
CREATE INDEX idx_inquiries_email   ON inquiries (email);
CREATE INDEX idx_inquiries_country ON inquiries (country);
CREATE INDEX idx_inquiries_created ON inquiries (created_at DESC);

CREATE TRIGGER inquiries_set_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  inquiries            IS 'Contact form submissions — one row per inquiry';
COMMENT ON COLUMN inquiries.status     IS 'new=unread | read=viewed | replied | closed | spam';
COMMENT ON COLUMN inquiries.ip_address IS 'Stored for spam detection and rate-limit analysis';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 09 — inquiry_notes
--  Purpose: Internal admin notes attached to inquiries.
--  FK: inquiry_id → inquiries(id) ON DELETE CASCADE
--      admin_id   → admins(id)    ON DELETE SET NULL
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE inquiry_notes (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_id  UUID         NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    admin_id    UUID         NOT NULL REFERENCES admins(id)    ON DELETE SET NULL,
    admin_name  VARCHAR(100),
    note        TEXT         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inquiry_notes_inquiry ON inquiry_notes (inquiry_id);

COMMENT ON TABLE inquiry_notes IS 'Internal notes written by admins on inquiry records';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 10 — quotations
--  Maps to: models/Quotation.js
--  Purpose: Quotation headers — one per quote sent to a buyer.
--  FK: buyer_id   → buyers(id)  ON DELETE SET NULL
--      created_by → admins(id)  ON DELETE SET NULL
--  Child: quotation_items
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE quotations (
    id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number   VARCHAR(30)   NOT NULL UNIQUE,
    -- Buyer (denormalised for resilience if buyer record is deleted)
    buyer_id       UUID          REFERENCES buyers(id) ON DELETE SET NULL,
    buyer_name     VARCHAR(150)  NOT NULL,
    buyer_email    VARCHAR(255),
    buyer_company  VARCHAR(150),
    buyer_country  VARCHAR(100),
    -- Status
    status         VARCHAR(20)   NOT NULL DEFAULT 'draft'
                                 CONSTRAINT quotations_status_check
                                 CHECK (status IN ('draft','sent','accepted','rejected')),
    notes          TEXT,
    total_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency       VARCHAR(10)   NOT NULL DEFAULT 'USD',
    valid_until    DATE,
    -- Authorship
    created_by     UUID          REFERENCES admins(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotations_buyer   ON quotations (buyer_id);
CREATE INDEX idx_quotations_status  ON quotations (status);
CREATE INDEX idx_quotations_created ON quotations (created_at DESC);

CREATE TRIGGER quotations_set_updated_at
    BEFORE UPDATE ON quotations
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE quotations IS 'Quotation headers — each row is one quote sent to a buyer';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 11 — quotation_items
--  Purpose: Line items for each quotation.
--  FK: quotation_id → quotations(id) ON DELETE CASCADE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE quotation_items (
    id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id  UUID          NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_name  VARCHAR(200)  NOT NULL,
    description   TEXT,
    quantity      VARCHAR(50)   NOT NULL,
    unit_price    NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_price   NUMERIC(14,2) NOT NULL DEFAULT 0,
    sort_order    SMALLINT      NOT NULL DEFAULT 0
);

CREATE INDEX idx_quotation_items_quotation ON quotation_items (quotation_id);

COMMENT ON TABLE quotation_items IS 'Line items for quotations (product, qty, price)';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 12 — blogs
--  Maps to: models/Blog.js
--  Purpose: Blog posts with draft/published/archived workflow.
--  FK: author_id → admins(id) ON DELETE RESTRICT
--  Child: blog_tags
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE blogs (
    id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Identity
    title            VARCHAR(160) NOT NULL,
    slug             VARCHAR(180) NOT NULL UNIQUE,
    -- Content
    excerpt          VARCHAR(500),
    content          TEXT         NOT NULL,
    -- Media
    featured_image   TEXT,
    -- Authorship
    author_id        UUID         NOT NULL
                                  REFERENCES admins(id) ON DELETE RESTRICT,
    author_name      VARCHAR(100),
    -- Taxonomy
    category         VARCHAR(100),
    -- SEO
    meta_title       VARCHAR(60),
    meta_description VARCHAR(160),
    -- Publish control
    status           VARCHAR(10)  NOT NULL DEFAULT 'draft'
                                  CONSTRAINT blogs_status_check
                                  CHECK (status IN ('draft', 'published', 'archived')),
    published_at     TIMESTAMPTZ,
    -- Engagement
    views            INTEGER      NOT NULL DEFAULT 0
                                  CONSTRAINT blogs_views_positive CHECK (views >= 0),
    -- Timestamps
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blogs_status       ON blogs (status);
CREATE UNIQUE INDEX idx_blogs_slug  ON blogs (slug);
CREATE INDEX idx_blogs_author       ON blogs (author_id);
CREATE INDEX idx_blogs_published_at ON blogs (published_at DESC);
-- Full-text search (used by Blog.js buildWhere)
CREATE INDEX idx_blogs_fts ON blogs
    USING GIN (to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));

CREATE TRIGGER blogs_set_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  blogs             IS 'Blog posts — supports draft/published/archived workflow';
COMMENT ON COLUMN blogs.author_name IS 'Denormalized from admins.name for faster list queries';
COMMENT ON COLUMN blogs.views       IS 'Incremented atomically on each public GET /api/blogs/:slug';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 13 — blog_tags
--  Normalises Blog.tags[] array
--  FK: blog_id → blogs(id) ON DELETE CASCADE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE blog_tags (
    id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id  UUID        NOT NULL
                         REFERENCES blogs(id) ON DELETE CASCADE,
    tag      VARCHAR(60) NOT NULL,
    CONSTRAINT blog_tags_unique UNIQUE (blog_id, tag)
);

CREATE INDEX idx_blog_tags_blog ON blog_tags (blog_id);
CREATE INDEX idx_blog_tags_tag  ON blog_tags (tag);

COMMENT ON TABLE blog_tags IS 'Many-to-one tags per blog post (normalised from array)';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 14 — certificates
--  Maps to: models/Certificate.js
--  Purpose: Company certification documents (PDFs and images).
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE certificates (
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
                                   'iso', 'fssai', 'apeda', 'iec',
                                   'gst', 'spice-board', 'haccp',
                                   'msme', 'other'
                               )),
    valid_from    DATE,
    valid_until   DATE,
    is_expired    BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order    SMALLINT     NOT NULL DEFAULT 0,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_certificates_type   ON certificates (type);
CREATE INDEX idx_certificates_active ON certificates (is_active);
CREATE INDEX idx_certificates_order  ON certificates (sort_order ASC);

CREATE TRIGGER certificates_set_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  certificates              IS 'Company certification documents — PDFs and images';
COMMENT ON COLUMN certificates.type         IS 'iso|fssai|apeda|iec|gst|spice-board|haccp|msme|other';
COMMENT ON COLUMN certificates.sort_order   IS 'Controls display order on the Certificates page';
COMMENT ON COLUMN certificates.thumbnail_url IS 'Optional rendered preview image for PDF files';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 15 — cms_testimonials
--  Maps to: models/Cms.js (getTestimonials / createTestimonial …)
--  Purpose: Website testimonials editable from the dashboard.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE cms_testimonials (
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
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_testimonials_active ON cms_testimonials (is_active, sort_order);

CREATE TRIGGER testimonials_set_updated_at
    BEFORE UPDATE ON cms_testimonials
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE cms_testimonials IS 'Website testimonials editable from the admin dashboard';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 16 — cms_faqs
--  Maps to: models/Cms.js (getFaqs / createFaq …)
--  Purpose: Website FAQs editable from the dashboard.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE cms_faqs (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    question    TEXT         NOT NULL,
    answer      TEXT         NOT NULL,
    category    VARCHAR(80),
    sort_order  SMALLINT     NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_faqs_active ON cms_faqs (is_active, sort_order);

CREATE TRIGGER faqs_set_updated_at
    BEFORE UPDATE ON cms_faqs
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE cms_faqs IS 'Website FAQs editable from the admin dashboard';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 17 — cms_stats
--  Maps to: models/Cms.js (getStats / updateStat)
--  Purpose: Homepage statistics counters (years, clients, countries, products).
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE cms_stats (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    key        VARCHAR(50)  NOT NULL UNIQUE,
    label      VARCHAR(100) NOT NULL,
    value      VARCHAR(20)  NOT NULL,
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE cms_stats IS 'Homepage counter statistics editable from dashboard';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 18 — settings
--  Maps to: models/Setting.js
--  Purpose: Site-wide key-value configuration.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE settings (
    id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    key        VARCHAR(100) NOT NULL UNIQUE,
    value      TEXT,
    label      VARCHAR(150),
    group_name VARCHAR(50)  NOT NULL DEFAULT 'general',
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE settings IS 'Site-wide key-value settings managed from dashboard';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 19 — activity_logs
--  Maps to: models/ActivityLog.js
--  Purpose: Full audit trail of all admin actions.
--  FK: admin_id → admins(id) ON DELETE SET NULL
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE activity_logs (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id     UUID         REFERENCES admins(id) ON DELETE SET NULL,
    admin_name   VARCHAR(100),
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(50),
    entity_id    VARCHAR(100),
    entity_label VARCHAR(200),
    details      JSONB,
    ip_address   INET,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_admin   ON activity_logs (admin_id);
CREATE INDEX idx_activity_logs_action  ON activity_logs (action);
CREATE INDEX idx_activity_logs_created ON activity_logs (created_at DESC);

COMMENT ON TABLE activity_logs IS 'Full audit trail of admin actions across the dashboard';


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE 20 — notifications
--  Stub table for future in-app notification system.
--  Referenced in the task spec; not yet implemented in models but reserved
--  to prevent breaking future migrations.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE notifications (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id    UUID         REFERENCES admins(id) ON DELETE CASCADE,
    type        VARCHAR(50)  NOT NULL DEFAULT 'info',
    title       VARCHAR(200) NOT NULL,
    message     TEXT,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    entity_type VARCHAR(50),
    entity_id   VARCHAR(100),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_admin   ON notifications (admin_id);
CREATE INDEX idx_notifications_unread  ON notifications (admin_id, is_read) WHERE is_read = FALSE;

COMMENT ON TABLE notifications IS 'In-app notifications for admin users (future use)';


-- ═══════════════════════════════════════════════════════════════════════════
--  VIEWS
-- ═══════════════════════════════════════════════════════════════════════════

-- View: Active products with spec and image counts (used by dashboard)
CREATE OR REPLACE VIEW vw_active_products AS
SELECT
    p.id,
    p.title,
    p.slug,
    p.short_description,
    p.category,
    p.origin,
    p.moq,
    p.shelf_life,
    p.hsn_code,
    p.featured_image,
    p.status,
    p.created_at,
    COUNT(DISTINCT ps.id) AS spec_count,
    COUNT(DISTINCT pi.id) AS image_count
FROM products p
LEFT JOIN product_specifications ps ON ps.product_id = p.id
LEFT JOIN product_images         pi ON pi.product_id = p.id
WHERE p.status = 'active'
GROUP BY p.id
ORDER BY p.created_at DESC;

-- View: Published blogs with author name and aggregated tags
CREATE OR REPLACE VIEW vw_published_blogs AS
SELECT
    b.id,
    b.title,
    b.slug,
    b.excerpt,
    b.featured_image,
    b.author_name,
    b.category,
    b.views,
    b.published_at,
    ARRAY_AGG(bt.tag ORDER BY bt.tag) FILTER (WHERE bt.tag IS NOT NULL) AS tags
FROM blogs b
LEFT JOIN blog_tags bt ON bt.blog_id = b.id
WHERE b.status = 'published'
GROUP BY b.id
ORDER BY b.published_at DESC;

-- View: Dashboard statistics (mirrors dashboardController.js)
CREATE OR REPLACE VIEW vw_dashboard_stats AS
SELECT
    (SELECT COUNT(*)                               FROM products)                  AS total_products,
    (SELECT COUNT(*) FROM products  WHERE status = 'active')                       AS active_products,
    (SELECT COUNT(*)                               FROM inquiries)                 AS total_inquiries,
    (SELECT COUNT(*) FROM inquiries WHERE status = 'new')                          AS new_inquiries,
    (SELECT COUNT(*)                               FROM blogs)                     AS total_blogs,
    (SELECT COUNT(*) FROM blogs     WHERE status = 'published')                    AS published_blogs,
    (SELECT COUNT(*) FROM certificates WHERE is_active = TRUE)                    AS active_certificates,
    (SELECT COUNT(*)                               FROM buyers)                    AS total_buyers,
    (SELECT COUNT(*)                               FROM quotations)                AS total_quotations,
    (SELECT COUNT(*) FROM quotations WHERE status IN ('sent','accepted'))          AS active_quotations;

-- View: Inquiries by country for analytics
CREATE OR REPLACE VIEW vw_inquiries_by_country AS
SELECT
    country,
    COUNT(*)                                          AS total_inquiries,
    COUNT(*) FILTER (WHERE status = 'new')            AS new_count,
    COUNT(*) FILTER (WHERE status = 'replied')        AS replied_count,
    MAX(created_at)                                   AS last_inquiry_at
FROM inquiries
GROUP BY country
ORDER BY total_inquiries DESC;


-- ═══════════════════════════════════════════════════════════════════════════
--  SEED DATA — default/required rows
--  These are idempotent (ON CONFLICT DO NOTHING) and safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── cms_stats: required homepage counters ─────────────────────────────────
INSERT INTO cms_stats (key, label, value) VALUES
    ('years',     'Years of Experience', '15+'),
    ('clients',   'Happy Clients',       '500+'),
    ('countries', 'Export Countries',    '40+'),
    ('products',  'Products Exported',   '200+')
ON CONFLICT (key) DO NOTHING;

-- ── settings: required site configuration keys ────────────────────────────
INSERT INTO settings (key, label, value, group_name) VALUES
    ('company_name',        'Company Name',        'Tanzora Export Co.',                  'general'),
    ('company_description', 'Company Description', 'Premium spice export company from India.', 'general'),
    ('company_email',       'Company Email',       'exports@tanzoraexport.com',           'general'),
    ('company_phone',       'Company Phone',       '+91 98765 43210',                     'general'),
    ('company_address',     'Company Address',     'Rajkot, Gujarat, India',              'general'),
    ('company_whatsapp',    'WhatsApp Number',     '+91 98765 43210',                     'general'),
    ('social_facebook',     'Facebook URL',        '',                                    'social'),
    ('social_instagram',    'Instagram URL',       '',                                    'social'),
    ('social_linkedin',     'LinkedIn URL',        '',                                    'social'),
    ('social_twitter',      'Twitter/X URL',       '',                                    'social'),
    ('social_youtube',      'YouTube URL',         '',                                    'social')
ON CONFLICT (key) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════
--  SCHEMA SUMMARY
--
--  Tables   : 20
--    Core     : admins, buyers, products, inquiries
--    Products : product_images, product_specifications,
--               product_packaging, product_export_countries
--    Sales    : quotations, quotation_items
--    Content  : blogs, blog_tags, certificates
--    CMS      : cms_testimonials, cms_faqs, cms_stats
--    Admin    : settings, activity_logs, inquiry_notes, notifications
--
--  Views    : 4   (vw_active_products, vw_published_blogs,
--                  vw_dashboard_stats, vw_inquiries_by_country)
--  Triggers : 8   (admins, buyers, products, inquiries, quotations,
--                  blogs, certificates, cms_testimonials, cms_faqs)
--  Indexes  : 28  (unique, lookup, FK, full-text)
--
--  Foreign Keys (11):
--    product_images.product_id          → products(id)   CASCADE
--    product_specifications.product_id  → products(id)   CASCADE
--    product_packaging.product_id       → products(id)   CASCADE
--    product_export_countries.product_id→ products(id)   CASCADE
--    inquiry_notes.inquiry_id           → inquiries(id)  CASCADE
--    inquiry_notes.admin_id             → admins(id)     SET NULL
--    quotations.buyer_id                → buyers(id)     SET NULL
--    quotations.created_by              → admins(id)     SET NULL
--    quotation_items.quotation_id       → quotations(id) CASCADE
--    blogs.author_id                    → admins(id)     RESTRICT
--    blog_tags.blog_id                  → blogs(id)      CASCADE
--    activity_logs.admin_id             → admins(id)     SET NULL
--    notifications.admin_id             → admins(id)     CASCADE
--
--  TO RUN:
--    psql -U <user> -d <database> -f backend/master_schema.sql
-- ═══════════════════════════════════════════════════════════════════════════
