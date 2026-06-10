-- ═══════════════════════════════════════════════════════════════════
--  001_admin_dashboard.sql — Tanzora Export Admin Dashboard Tables
--  Run: psql -U postgres -d tanzora_export -f backend/migrations/001_admin_dashboard.sql
-- ═══════════════════════════════════════════════════════════════════

-- ── Ensure updated_at trigger function exists (from schema.sql) ───
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Drop tables in reverse dependency order ───────────────────────
DROP TABLE IF EXISTS activity_logs       CASCADE;
DROP TABLE IF EXISTS quotation_items     CASCADE;
DROP TABLE IF EXISTS quotations          CASCADE;
DROP TABLE IF EXISTS inquiry_notes       CASCADE;
DROP TABLE IF EXISTS buyers              CASCADE;
DROP TABLE IF EXISTS cms_faqs            CASCADE;
DROP TABLE IF EXISTS cms_testimonials    CASCADE;
DROP TABLE IF EXISTS cms_stats           CASCADE;
DROP TABLE IF EXISTS settings            CASCADE;

-- ═══════════════════════════════════════════════════════════════════
--  TABLE: buyers
--  Registered buyer contact records managed from the dashboard
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE buyers (
    id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(100)  NOT NULL,
    company          VARCHAR(150),
    email            VARCHAR(255)  NOT NULL UNIQUE,
    phone            VARCHAR(30),
    country          VARCHAR(100),
    notes            TEXT,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_buyers_email   ON buyers (email);
CREATE INDEX idx_buyers_country ON buyers (country);
CREATE INDEX idx_buyers_name    ON buyers (LOWER(name));

CREATE TRIGGER buyers_set_updated_at
    BEFORE UPDATE ON buyers
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE buyers IS 'Registered buyers managed from the admin dashboard';

-- ═══════════════════════════════════════════════════════════════════
--  TABLE: inquiry_notes
--  Internal admin notes attached to inquiries
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE inquiry_notes (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_id   UUID         NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    admin_id     UUID         NOT NULL REFERENCES admins(id)    ON DELETE SET NULL,
    admin_name   VARCHAR(100),
    note         TEXT         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inquiry_notes_inquiry ON inquiry_notes (inquiry_id);

COMMENT ON TABLE inquiry_notes IS 'Internal notes written by admins on inquiry records';

-- ═══════════════════════════════════════════════════════════════════
--  TABLE: quotations
--  Quote header — one per quotation sent to a buyer
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE quotations (
    id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number   VARCHAR(30)   NOT NULL UNIQUE,  -- e.g. TZQ-2026-001
    buyer_id       UUID          REFERENCES buyers(id) ON DELETE SET NULL,
    buyer_name     VARCHAR(150)  NOT NULL,          -- denormalized
    buyer_email    VARCHAR(255),
    buyer_company  VARCHAR(150),
    buyer_country  VARCHAR(100),
    status         VARCHAR(20)   NOT NULL DEFAULT 'draft'
                                 CONSTRAINT quotations_status_check
                                 CHECK (status IN ('draft','sent','accepted','rejected')),
    notes          TEXT,
    total_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency       VARCHAR(10)   NOT NULL DEFAULT 'USD',
    valid_until    DATE,
    created_by     UUID          REFERENCES admins(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotations_buyer  ON quotations (buyer_id);
CREATE INDEX idx_quotations_status ON quotations (status);
CREATE INDEX idx_quotations_created ON quotations (created_at DESC);

CREATE TRIGGER quotations_set_updated_at
    BEFORE UPDATE ON quotations
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE quotations IS 'Quotation headers — each row is one quote sent to a buyer';

-- ═══════════════════════════════════════════════════════════════════
--  TABLE: quotation_items
--  Line items for each quotation
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE quotation_items (
    id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id    UUID          NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_name    VARCHAR(200)  NOT NULL,
    description     TEXT,
    quantity        VARCHAR(50)   NOT NULL,   -- e.g. "500 kg", "2 MT"
    unit_price      NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_price     NUMERIC(14,2) NOT NULL DEFAULT 0,
    sort_order      SMALLINT      NOT NULL DEFAULT 0
);

CREATE INDEX idx_quotation_items_quotation ON quotation_items (quotation_id);

COMMENT ON TABLE quotation_items IS 'Line items for quotations (product, qty, price)';

-- ═══════════════════════════════════════════════════════════════════
--  TABLE: cms_testimonials
--  Website testimonials editable from the dashboard
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE cms_testimonials (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ═══════════════════════════════════════════════════════════════════
--  TABLE: cms_faqs
--  Website FAQs editable from the dashboard
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE cms_faqs (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ═══════════════════════════════════════════════════════════════════
--  TABLE: cms_stats
--  Homepage statistics (years, clients, countries, products)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE cms_stats (
    id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    key        VARCHAR(50)  NOT NULL UNIQUE,  -- e.g. 'years', 'clients', 'countries', 'products'
    label      VARCHAR(100) NOT NULL,
    value      VARCHAR(20)  NOT NULL,         -- e.g. '15+', '500+', '40+'
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO cms_stats (key, label, value) VALUES
    ('years',     'Years of Experience', '15+'),
    ('clients',   'Happy Clients',       '500+'),
    ('countries', 'Export Countries',    '40+'),
    ('products',  'Products Exported',   '200+')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE cms_stats IS 'Homepage counter statistics editable from dashboard';

-- ═══════════════════════════════════════════════════════════════════
--  TABLE: settings
--  Company & site settings stored as key-value pairs
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE settings (
    id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    key        VARCHAR(100) NOT NULL UNIQUE,
    value      TEXT,
    label      VARCHAR(150),
    group_name VARCHAR(50)  NOT NULL DEFAULT 'general',
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO settings (key, label, value, group_name) VALUES
    ('company_name',        'Company Name',        'Tanzora Export Co.',          'general'),
    ('company_description', 'Company Description', 'Premium spice export company from India.', 'general'),
    ('company_email',       'Company Email',       'exports@tanzoraexport.com',   'general'),
    ('company_phone',       'Company Phone',       '+91 98765 43210',             'general'),
    ('company_address',     'Company Address',     'Rajkot, Gujarat, India',      'general'),
    ('company_whatsapp',    'WhatsApp Number',     '+91 98765 43210',             'general'),
    ('social_facebook',     'Facebook URL',        '',                            'social'),
    ('social_instagram',    'Instagram URL',       '',                            'social'),
    ('social_linkedin',     'LinkedIn URL',        '',                            'social'),
    ('social_twitter',      'Twitter/X URL',       '',                            'social'),
    ('social_youtube',      'YouTube URL',         '',                            'social')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE settings IS 'Site-wide key-value settings managed from dashboard';


-- ═══════════════════════════════════════════════════════════════════
--  TABLE: activity_logs
--  Audit trail of all admin actions
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE activity_logs (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id     UUID         REFERENCES admins(id) ON DELETE SET NULL,
    admin_name   VARCHAR(100),
    action       VARCHAR(100) NOT NULL,   -- e.g. 'product.create', 'inquiry.status_update'
    entity_type  VARCHAR(50),             -- e.g. 'product', 'inquiry', 'quotation'
    entity_id    VARCHAR(100),            -- UUID or slug
    entity_label VARCHAR(200),            -- human-readable name
    details      JSONB,                   -- additional context
    ip_address   INET,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_admin   ON activity_logs (admin_id);
CREATE INDEX idx_activity_logs_action  ON activity_logs (action);
CREATE INDEX idx_activity_logs_created ON activity_logs (created_at DESC);

COMMENT ON TABLE activity_logs IS 'Full audit trail of admin actions across the dashboard';

-- ═══════════════════════════════════════════════════════════════════
--  SCHEMA COMPLETE
--  New tables: buyers, inquiry_notes, quotations, quotation_items,
--              cms_testimonials, cms_faqs, cms_stats,
--              settings, activity_logs
-- ═══════════════════════════════════════════════════════════════════
