-- Migration: Update cms_stats with correct homepage values
-- This ensures dynamic statistics match the expected display values

UPDATE cms_stats SET value = '30+' WHERE key = 'years';
UPDATE cms_stats SET value = '500+' WHERE key = 'clients';
UPDATE cms_stats SET value = '50+' WHERE key = 'countries';
UPDATE cms_stats SET value = '5000+' WHERE key = 'products';

-- Ensure all keys exist
INSERT INTO cms_stats (key, label, value) VALUES
  ('years',     'Years of Experience', '30+'),
  ('clients',   'Happy Clients',       '500+'),
  ('countries', 'Export Countries',    '50+'),
  ('products',  'MT Annual Export',    '5000+')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();
