-- SideQuest Migration 007: Seed Data
-- Seeds: dim_category, dim_date (3 years: 2025-2028)

-- ============================================================================
-- dim_category seed data
-- ============================================================================
INSERT INTO dim_category (name, icon_slug) VALUES
  ('Outdoors',        'outdoors'),
  ('Sports & Fitness','sports'),
  ('Food & Drinks',   'food'),
  ('Arts & Culture',  'arts'),
  ('Travel & Explore','travel'),
  ('Social',          'social'),
  ('Other',           'other')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- dim_date seed data (2025-01-01 to 2028-12-31)
-- ============================================================================
INSERT INTO dim_date (date_id, full_date, day_of_week, day_number, week_number, month, month_number, quarter, year, is_weekend, is_holiday_ca)
SELECT
  TO_CHAR(d, 'YYYYMMDD')::INTEGER AS date_id,
  d AS full_date,
  TRIM(TO_CHAR(d, 'Day')) AS day_of_week,
  EXTRACT(ISODOW FROM d)::SMALLINT AS day_number,
  EXTRACT(WEEK FROM d)::SMALLINT AS week_number,
  TRIM(TO_CHAR(d, 'Month')) AS month,
  EXTRACT(MONTH FROM d)::SMALLINT AS month_number,
  EXTRACT(QUARTER FROM d)::SMALLINT AS quarter,
  EXTRACT(YEAR FROM d)::SMALLINT AS year,
  EXTRACT(ISODOW FROM d) IN (6, 7) AS is_weekend,
  -- Canadian statutory holidays (simplified - major ones)
  d IN (
    -- 2025
    '2025-01-01'::DATE, '2025-02-17'::DATE, '2025-04-18'::DATE, '2025-05-19'::DATE,
    '2025-07-01'::DATE, '2025-08-04'::DATE, '2025-09-01'::DATE, '2025-10-13'::DATE,
    '2025-11-11'::DATE, '2025-12-25'::DATE, '2025-12-26'::DATE,
    -- 2026
    '2026-01-01'::DATE, '2026-02-16'::DATE, '2026-04-03'::DATE, '2026-05-18'::DATE,
    '2026-07-01'::DATE, '2026-08-03'::DATE, '2026-09-07'::DATE, '2026-10-12'::DATE,
    '2026-11-11'::DATE, '2026-12-25'::DATE, '2026-12-26'::DATE,
    -- 2027
    '2027-01-01'::DATE, '2027-02-15'::DATE, '2027-03-26'::DATE, '2027-05-24'::DATE,
    '2027-07-01'::DATE, '2027-08-02'::DATE, '2027-09-06'::DATE, '2027-10-11'::DATE,
    '2027-11-11'::DATE, '2027-12-25'::DATE, '2027-12-26'::DATE,
    -- 2028
    '2028-01-01'::DATE, '2028-02-21'::DATE, '2028-04-14'::DATE, '2028-05-22'::DATE,
    '2028-07-01'::DATE, '2028-08-07'::DATE, '2028-09-04'::DATE, '2028-10-09'::DATE,
    '2028-11-11'::DATE, '2028-12-25'::DATE, '2028-12-26'::DATE
  ) AS is_holiday_ca
FROM generate_series('2025-01-01'::DATE, '2028-12-31'::DATE, '1 day'::INTERVAL) AS d
ON CONFLICT (date_id) DO NOTHING;
