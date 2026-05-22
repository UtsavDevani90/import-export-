-- ═══════════════════════════════════════════════════════════════════
--  schema.sql — Tanzora Export Co. Relational Database Schema
--  Database: PostgreSQL 15+ (also compatible with MySQL 8+ with minor
--            syntax adjustments noted in comments)
--
--  This file documents the complete data structure that mirrors the
--  MongoDB/Mongoose models used in the Node.js backend.
--  Use this for:
--   • SQL documentation & data modeling reference
--   • PostgreSQL / MySQL migration
--   • Generating ERDs in tools like dbdiagram.io or DBeaver
--   • Interview / technical review purposes
--
--  Run order:
--   1. admins
--   2. products
--   3. product_images
--   4. product_specifications
--   5. product_packaging
--   6. product_export_countries
--   7. inquiries
--   8. blogs
--   9. blog_tags
--  10. certificates
-- ═══════════════════════════════════════════════════════════════════

-- ─── Enable UUID extension (PostgreSQL) ──────────────────────────
-- MySQL: UUIDs are handled via VARCHAR(36) + UUID() function
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Drop tables in reverse dependency order (for re-runs) ────────
DROP TABLE IF EXISTS product_export_countries CASCADE;
DROP TABLE IF EXISTS product_packaging         CASCADE;
DROP TABLE IF EXISTS product_specifications    CASCADE;
DROP TABLE IF EXISTS product_images            CASCADE;
DROP TABLE IF EXISTS blog_tags                 CASCADE;
DROP TABLE IF EXISTS certificates              CASCADE;
DROP TABLE IF EXISTS blogs                     CASCADE;
DROP TABLE IF EXISTS inquiries                 CASCADE;
DROP TABLE IF EXISTS products                  CASCADE;
DROP TABLE IF EXISTS admins                    CASCADE;

-- ═══════════════════════════════════════════════════════════════════
--  TABLE 1 — admins
--  Maps to: models/Admin.js
--  Purpose: Admin user accounts with bcrypt-hashed passwords
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE admins (
    id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
                               -- MySQL equivalent: id CHAR(36) PRIMARY KEY DEFAULT (UUID())

    -- ── Core fields ───────────────────────────────────────────────
    name         VARCHAR(60)   NOT NULL
                               CONSTRAINT admins_name_not_empty CHECK (TRIM(name) <> ''),

    email        VARCHAR(255)  NOT NULL UNIQUE,
                               -- Enforces uniqueness like Mongoose unique:true

    password     TEXT          NOT NULL,
                               -- Stores bcrypt hash (always 60 chars but TEXT is safer)

    role         VARCHAR(20)   NOT NULL DEFAULT 'admin'
                               CONSTRAINT admins_role_check
                               CHECK (role IN ('admin', 'superadmin')),

    is_active    BOOLEAN       NOT NULL DEFAULT TRUE,

    last_login   TIMESTAMPTZ,  -- NULL until first login

    -- ── Timestamps (equivalent to Mongoose timestamps:true) ───────
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for fast login lookups by email
CREATE INDEX idx_admins_email ON admins (email);

-- Trigger: auto-update updated_at on row change (PostgreSQL)
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admins_set_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  admins           IS 'Admin user accounts — passwords stored as bcrypt hashes';
COMMENT ON COLUMN admins.password  IS 'bcrypt hash (cost factor 12) — NEVER store plaintext';
COMMENT ON COLUMN admins.role      IS 'admin = standard | superadmin = full access';


-- ═══════════════════════════════════════════════════════════════════
--  TABLE 2 — products
--  Maps to: models/Product.js
--  Note: Arrays (images, specs, packaging, exportCountries) are
--        normalized into separate child tables below.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE products (
    id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- ── Identity ──────────────────────────────────────────────────
    title             VARCHAR(120)  NOT NULL,
    slug              VARCHAR(140)  NOT NULL UNIQUE,
                                    -- Auto-generated from title, URL-safe

    -- ── Content ───────────────────────────────────────────────────
    short_description VARCHAR(300)  NOT NULL,
    description       TEXT          NOT NULL,

    -- ── Classification ────────────────────────────────────────────
    category          VARCHAR(30)   NOT NULL
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

    -- ── Export details ────────────────────────────────────────────
    origin            VARCHAR(200)  NOT NULL,
    moq               VARCHAR(50)   NOT NULL,   -- e.g. '500 kg'
    shelf_life        VARCHAR(50),              -- e.g. '24 Months'
    hsn_code          VARCHAR(20),              -- Harmonized System code

    -- ── Primary image (others in product_images) ──────────────────
    featured_image    TEXT,                     -- File path or URL

    -- ── Visibility ────────────────────────────────────────────────
    status            VARCHAR(10)   NOT NULL DEFAULT 'active'
                                    CONSTRAINT products_status_check
                                    CHECK (status IN ('active', 'inactive', 'draft')),

    -- ── SEO ───────────────────────────────────────────────────────
    meta_title        VARCHAR(60),
    meta_description  VARCHAR(160),

    -- ── Timestamps ────────────────────────────────────────────────
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_status   ON products (status);
CREATE INDEX idx_products_slug     ON products (slug);
-- Full-text search index (PostgreSQL)
CREATE INDEX idx_products_fts ON products
    USING GIN (to_tsvector('english', title || ' ' || short_description || ' ' || description));

CREATE TRIGGER products_set_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  products             IS 'Product catalog — maps to MongoDB Product model';
COMMENT ON COLUMN products.slug        IS 'URL-safe identifier auto-generated from title via slugify';
COMMENT ON COLUMN products.moq         IS 'Minimum Order Quantity, e.g. 500 kg or 1 MT';
COMMENT ON COLUMN products.hsn_code    IS 'Indian Harmonized System of Nomenclature tariff code';


-- ═══════════════════════════════════════════════════════════════════
--  TABLE 3 — product_images
--  Normalizes the Product.images[] array
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE product_images (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID         NOT NULL
                             REFERENCES products(id) ON DELETE CASCADE,
    url         TEXT         NOT NULL,           -- /uploads/images/filename.webp
    sort_order  SMALLINT     NOT NULL DEFAULT 0, -- Display order (0 = first)
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images (product_id);

COMMENT ON TABLE product_images IS 'One-to-many: each product can have multiple images';


-- ═══════════════════════════════════════════════════════════════════
--  TABLE 4 — product_specifications
--  Normalizes the Product.specifications[{label, value}] array
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE product_specifications (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID         NOT NULL
                             REFERENCES products(id) ON DELETE CASCADE,
    label       VARCHAR(100) NOT NULL,   -- e.g. 'Curcumin Content'
    value       VARCHAR(200) NOT NULL,   -- e.g. '3–5%'
    sort_order  SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_specs_product ON product_specifications (product_id);

COMMENT ON TABLE product_specifications IS 'Key-value specification pairs per product';


-- ═══════════════════════════════════════════════════════════════════
--  TABLE 5 — product_packaging
--  Normalizes the Product.packaging[] string array
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE product_packaging (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID         NOT NULL
                             REFERENCES products(id) ON DELETE CASCADE,
    option      VARCHAR(150) NOT NULL,   -- e.g. '25 kg PP Bags'
    sort_order  SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_packaging_product ON product_packaging (product_id);


-- ═══════════════════════════════════════════════════════════════════
--  TABLE 6 — product_export_countries
--  Normalizes the Product.exportCountries[] array
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE product_export_countries (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID         NOT NULL
                             REFERENCES products(id) ON DELETE CASCADE,
    country     VARCHAR(100) NOT NULL    -- e.g. 'Germany', 'USA'
);

CREATE INDEX idx_product_countries_product ON product_export_countries (product_id);
CREATE INDEX idx_product_countries_country ON product_export_countries (country);


-- ═══════════════════════════════════════════════════════════════════
--  TABLE 7 — inquiries
--  Maps to: models/Inquiry.js
--  Purpose: Contact form submissions from the website
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE inquiries (
    id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- ── Submitter ─────────────────────────────────────────────────
    name         VARCHAR(80)   NOT NULL,
    company      VARCHAR(120),
    email        VARCHAR(255)  NOT NULL,
    phone        VARCHAR(30),
    country      VARCHAR(100)  NOT NULL,

    -- ── Inquiry details ───────────────────────────────────────────
    product      VARCHAR(150),            -- Product of interest
    quantity     VARCHAR(80),             -- e.g. '5 MT', '2000 kg'
    subject      VARCHAR(100),            -- Dropdown selection
    message      TEXT
                 CONSTRAINT inquiry_message_length
                 CHECK (CHAR_LENGTH(message) <= 2000),

    -- ── Admin workflow ────────────────────────────────────────────
    status       VARCHAR(10)   NOT NULL DEFAULT 'new'
                               CONSTRAINT inquiries_status_check
                               CHECK (status IN ('new', 'read', 'replied', 'closed', 'spam')),
    admin_notes  TEXT,

    -- ── Request metadata (spam analysis, audit) ───────────────────
    ip_address   INET,         -- PostgreSQL native IP type | MySQL: VARCHAR(45)
    user_agent   TEXT,

    -- ── Timestamps ────────────────────────────────────────────────
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inquiries_status     ON inquiries (status);
CREATE INDEX idx_inquiries_email      ON inquiries (email);
CREATE INDEX idx_inquiries_country    ON inquiries (country);
CREATE INDEX idx_inquiries_created    ON inquiries (created_at DESC);

CREATE TRIGGER inquiries_set_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  inquiries            IS 'Contact form submissions — one row per inquiry';
COMMENT ON COLUMN inquiries.status     IS 'new=unread | read=viewed | replied | closed | spam';
COMMENT ON COLUMN inquiries.ip_address IS 'Stored for spam detection and rate-limit analysis';


-- ═══════════════════════════════════════════════════════════════════
--  TABLE 8 — blogs
--  Maps to: models/Blog.js
--  Purpose: Blog post content with publish workflow
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE blogs (
    id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- ── Identity ──────────────────────────────────────────────────
    title            VARCHAR(160)  NOT NULL,
    slug             VARCHAR(180)  NOT NULL UNIQUE,

    -- ── Content ───────────────────────────────────────────────────
    excerpt          VARCHAR(500),          -- Short teaser (used in list views)
    content          TEXT          NOT NULL, -- Rich HTML or Markdown body

    -- ── Media ─────────────────────────────────────────────────────
    featured_image   TEXT,                  -- /uploads/images/filename.jpg

    -- ── Authorship (FK to admins table) ───────────────────────────
    author_id        UUID          NOT NULL
                                   REFERENCES admins(id) ON DELETE RESTRICT,
    author_name      VARCHAR(100),          -- Denormalized for performance

    -- ── Taxonomy ──────────────────────────────────────────────────
    category         VARCHAR(100),

    -- ── SEO ───────────────────────────────────────────────────────
    meta_title       VARCHAR(60),
    meta_description VARCHAR(160),

    -- ── Publish control ───────────────────────────────────────────
    status           VARCHAR(10)   NOT NULL DEFAULT 'draft'
                                   CONSTRAINT blogs_status_check
                                   CHECK (status IN ('draft', 'published', 'archived')),
    published_at     TIMESTAMPTZ,           -- Set when status → 'published'

    -- ── Engagement ────────────────────────────────────────────────
    views            INTEGER       NOT NULL DEFAULT 0
                                   CONSTRAINT blogs_views_positive CHECK (views >= 0),

    -- ── Timestamps ────────────────────────────────────────────────
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blogs_status       ON blogs (status);
CREATE INDEX idx_blogs_slug         ON blogs (slug);
CREATE INDEX idx_blogs_author       ON blogs (author_id);
CREATE INDEX idx_blogs_published_at ON blogs (published_at DESC);
-- Full-text search
CREATE INDEX idx_blogs_fts ON blogs
    USING GIN (to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));

CREATE TRIGGER blogs_set_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  blogs              IS 'Blog posts — supports draft/published/archived workflow';
COMMENT ON COLUMN blogs.author_name  IS 'Denormalized from admins.name for faster list queries';
COMMENT ON COLUMN blogs.views        IS 'Incremented atomically on each public GET /api/blogs/:slug';


-- ═══════════════════════════════════════════════════════════════════
--  TABLE 9 — blog_tags
--  Normalizes the Blog.tags[] array
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE blog_tags (
    id       UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id  UUID         NOT NULL
                          REFERENCES blogs(id) ON DELETE CASCADE,
    tag      VARCHAR(60)  NOT NULL,
    CONSTRAINT blog_tags_unique UNIQUE (blog_id, tag)  -- No duplicate tags per post
);

CREATE INDEX idx_blog_tags_blog ON blog_tags (blog_id);
CREATE INDEX idx_blog_tags_tag  ON blog_tags (tag);

COMMENT ON TABLE blog_tags IS 'Many-to-one tags per blog post (normalized from array)';


-- ═══════════════════════════════════════════════════════════════════
--  TABLE 10 — certificates
--  Maps to: models/Certificate.js
--  Purpose: Uploaded certification documents (PDFs and images)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE certificates (
    id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- ── Display ───────────────────────────────────────────────────
    title         VARCHAR(120)  NOT NULL,
    description   VARCHAR(500),
    issuer        VARCHAR(150),              -- e.g. 'Bureau Veritas', 'APEDA'

    -- ── File storage ──────────────────────────────────────────────
    file_url      TEXT          NOT NULL,    -- /uploads/certificates/uuid.pdf
    file_type     VARCHAR(10)   NOT NULL
                                CONSTRAINT certificates_file_type_check
                                CHECK (file_type IN ('pdf','jpg','jpeg','png','webp')),
    thumbnail_url TEXT,                      -- Optional preview for PDF certificates

    -- ── Classification ────────────────────────────────────────────
    type          VARCHAR(20)   NOT NULL
                                CONSTRAINT certificates_type_check
                                CHECK (type IN (
                                    'iso', 'fssai', 'apeda', 'iec',
                                    'gst', 'spice-board', 'haccp',
                                    'msme', 'other'
                                )),

    -- ── Validity ──────────────────────────────────────────────────
    valid_from    DATE,
    valid_until   DATE,
    is_expired    BOOLEAN       NOT NULL DEFAULT FALSE,

    -- ── Display control ───────────────────────────────────────────
    sort_order    SMALLINT      NOT NULL DEFAULT 0,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,

    -- ── Timestamps ────────────────────────────────────────────────
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_certificates_type      ON certificates (type);
CREATE INDEX idx_certificates_active    ON certificates (is_active);
CREATE INDEX idx_certificates_order     ON certificates (sort_order ASC);

CREATE TRIGGER certificates_set_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  certificates             IS 'Company certification documents — PDFs and images';
COMMENT ON COLUMN certificates.type        IS 'iso|fssai|apeda|iec|gst|spice-board|haccp|msme|other';
COMMENT ON COLUMN certificates.sort_order  IS 'Controls display order on the Certificates page';
COMMENT ON COLUMN certificates.thumbnail_url IS 'Optional rendered preview image for PDF files';


-- ═══════════════════════════════════════════════════════════════════
--  SAMPLE SEED DATA — for development / testing
--  Remove or comment out before production use
-- ═══════════════════════════════════════════════════════════════════

-- ── Seed: Super admin (password field is a bcrypt placeholder) ────
INSERT INTO admins (name, email, password, role) VALUES
    (
        'Utsav Devani',
        'utsav@tanzoraexport.com',
        '$2b$12$PLACEHOLDER_HASH_REPLACE_WITH_REAL_BCRYPT', -- Never store plaintext
        'superadmin'
    ),
    (
        'Arjun Bhavani',
        'arjun@tanzoraexport.com',
        '$2b$12$PLACEHOLDER_HASH_REPLACE_WITH_REAL_BCRYPT',
        'admin'
    );

-- ── Seed: Sample product ──────────────────────────────────────────
INSERT INTO products (
    title, slug, short_description, description,
    category, origin, moq, shelf_life, hsn_code, status
) VALUES (
    'Turmeric Powder',
    'turmeric-powder',
    'Premium quality golden turmeric with high curcumin content.',
    'Tanzora Turmeric Powder is sourced from the finest Erode and Rajapuri varieties, renowned worldwide for their rich golden color and high curcumin content (3–5%). Processed under strict hygiene standards.',
    'powder-spices',
    'Erode, Tamil Nadu / Rajasthan, India',
    '500 kg',
    '24 Months',
    '0910 30 10',
    'active'
);

-- ── Seed: Specifications for Turmeric ────────────────────────────
INSERT INTO product_specifications (product_id, label, value, sort_order)
SELECT id, 'Curcumin Content', '3–5%',    0 FROM products WHERE slug = 'turmeric-powder'
UNION ALL
SELECT id, 'Moisture',         'Max 10%', 1 FROM products WHERE slug = 'turmeric-powder'
UNION ALL
SELECT id, 'Color Value (ASTA)','≥ 20',   2 FROM products WHERE slug = 'turmeric-powder'
UNION ALL
SELECT id, 'Total Ash',        'Max 7%',  3 FROM products WHERE slug = 'turmeric-powder'
UNION ALL
SELECT id, 'Mesh Size',        '40–60 Mesh', 4 FROM products WHERE slug = 'turmeric-powder';

-- ── Seed: Packaging for Turmeric ─────────────────────────────────
INSERT INTO product_packaging (product_id, option, sort_order)
SELECT id, '25 kg PP Bags',                0 FROM products WHERE slug = 'turmeric-powder'
UNION ALL
SELECT id, '50 kg PP Bags',                1 FROM products WHERE slug = 'turmeric-powder'
UNION ALL
SELECT id, 'Custom Packaging Available',   2 FROM products WHERE slug = 'turmeric-powder';

-- ── Seed: Sample certificates ─────────────────────────────────────
INSERT INTO certificates (title, description, issuer, file_url, file_type, type, sort_order) VALUES
    ('ISO 22000:2018',       'Food Safety Management System certification',          'Bureau Veritas', '/uploads/certificates/iso-22000.pdf',    'pdf', 'iso',         0),
    ('FSSAI License',        'Food Safety & Standards Authority of India license',   'FSSAI, GOI',     '/uploads/certificates/fssai.pdf',         'pdf', 'fssai',       1),
    ('APEDA Registration',   'Agricultural & Processed Food Export Certification',   'APEDA, GOI',     '/uploads/certificates/apeda.pdf',         'pdf', 'apeda',       2),
    ('IEC Certificate',      'Import Export Code issued by DGFT',                   'DGFT, GOI',      '/uploads/certificates/iec.pdf',           'pdf', 'iec',         3),
    ('GST Certificate',      'Goods & Services Tax registration',                   'GST Council',    '/uploads/certificates/gst.pdf',           'pdf', 'gst',         4),
    ('Spice Board India',    'Registered spice exporter — Govt. of India',          'Spice Board',    '/uploads/certificates/spice-board.pdf',   'pdf', 'spice-board', 5),
    ('HACCP Certificate',    'Hazard Analysis & Critical Control Points compliance', 'SGS',            '/uploads/certificates/haccp.pdf',         'pdf', 'haccp',       6),
    ('MSME Certificate',     'Micro, Small & Medium Enterprise registration',        'MSME, GOI',      '/uploads/certificates/msme.pdf',          'pdf', 'msme',        7);


-- ═══════════════════════════════════════════════════════════════════
--  USEFUL VIEWS — pre-built queries for common frontend needs
-- ═══════════════════════════════════════════════════════════════════

-- View: Active products with their specification count
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

-- View: Published blogs with author name
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
    (SELECT COUNT(*)                       FROM products)                 AS total_products,
    (SELECT COUNT(*) FROM products WHERE status = 'active')               AS active_products,
    (SELECT COUNT(*)                       FROM inquiries)                AS total_inquiries,
    (SELECT COUNT(*) FROM inquiries WHERE status = 'new')                 AS new_inquiries,
    (SELECT COUNT(*)                       FROM blogs)                    AS total_blogs,
    (SELECT COUNT(*) FROM blogs    WHERE status = 'published')            AS published_blogs,
    (SELECT COUNT(*) FROM certificates WHERE is_active = TRUE)           AS active_certificates;

-- View: Inquiries by country for analytics
CREATE OR REPLACE VIEW vw_inquiries_by_country AS
SELECT
    country,
    COUNT(*)                                        AS total_inquiries,
    COUNT(*) FILTER (WHERE status = 'new')          AS new_count,
    COUNT(*) FILTER (WHERE status = 'replied')      AS replied_count,
    MAX(created_at)                                 AS last_inquiry_at
FROM inquiries
GROUP BY country
ORDER BY total_inquiries DESC;


-- ═══════════════════════════════════════════════════════════════════
--  SCHEMA COMPLETE
--
--  Tables:   10  (admins, products, product_images,
--                 product_specifications, product_packaging,
--                 product_export_countries, inquiries,
--                 blogs, blog_tags, certificates)
--  Views:     4  (vw_active_products, vw_published_blogs,
--                 vw_dashboard_stats, vw_inquiries_by_country)
--  Triggers:  4  (auto-update updated_at on all main tables)
--  Indexes:  20+ (performance + full-text search)
--
--  To run in PostgreSQL:
--    psql -U <user> -d <database> -f schema.sql
--
--  To run in MySQL (adjust these first):
--    • Replace UUID / uuid_generate_v4() → CHAR(36) / UUID()
--    • Replace TIMESTAMPTZ → DATETIME
--    • Replace BOOLEAN → TINYINT(1)
--    • Replace INET → VARCHAR(45)
--    • Replace GIN indexes → FULLTEXT indexes
--    • Remove CREATE EXTENSION and PL/pgSQL trigger functions
--    • Use triggers with MySQL DELIMITER syntax
-- ═══════════════════════════════════════════════════════════════════
