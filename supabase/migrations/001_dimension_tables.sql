-- SideQuest Migration 001: Dimension Tables
-- Creates: dim_date, dim_category, dim_location, dim_user, dim_quest

-- ============================================================================
-- dim_date (no FKs - create first)
-- ============================================================================
CREATE TABLE dim_date (
  date_id       INTEGER PRIMARY KEY,         -- YYYYMMDD integer key e.g. 20260421
  full_date     DATE NOT NULL UNIQUE,
  day_of_week   TEXT NOT NULL,               -- 'Monday'..'Sunday'
  day_number    SMALLINT NOT NULL,           -- 1-7
  week_number   SMALLINT NOT NULL,           -- ISO week
  month         TEXT NOT NULL,
  month_number  SMALLINT NOT NULL,
  quarter       SMALLINT NOT NULL,
  year          SMALLINT NOT NULL,
  is_weekend    BOOLEAN NOT NULL,
  is_holiday_ca BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================================
-- dim_category (no FKs)
-- ============================================================================
CREATE TABLE dim_category (
  category_id   SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  icon_slug     TEXT NOT NULL,               -- maps to icon set in app
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- dim_location (no FKs)
-- ============================================================================
CREATE TABLE dim_location (
  location_id     SERIAL PRIMARY KEY,
  neighborhood    TEXT NOT NULL,             -- shown publicly (e.g. "Kensington")
  city            TEXT NOT NULL DEFAULT 'Calgary',
  province        TEXT NOT NULL DEFAULT 'AB',
  country         TEXT NOT NULL DEFAULT 'CA',
  lat_area        NUMERIC(9,6) NOT NULL,     -- neighborhood centroid, shown in feed
  lng_area        NUMERIC(9,6) NOT NULL,
  lat_exact       NUMERIC(9,6) NOT NULL,     -- precise pin, revealed on join only
  lng_exact       NUMERIC(9,6) NOT NULL,
  geohash         TEXT NOT NULL,             -- for proximity queries (precision 5 = ~4km)
  address_text    TEXT DEFAULT NULL          -- human-readable, revealed on join
);

CREATE INDEX idx_dim_location_geohash ON dim_location(geohash);

-- ============================================================================
-- dim_user (no FKs to other dims)
-- ============================================================================
CREATE TABLE dim_user (
  user_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash        TEXT UNIQUE NOT NULL,           -- SHA-256 of phone, never store raw
  first_name        TEXT NOT NULL,
  photo_url         TEXT NOT NULL,
  age               SMALLINT NOT NULL CHECK (age >= 18),
  gender            TEXT NOT NULL
                    CHECK (gender IN ('man','woman','non_binary','prefer_not_to_say')),
  rating_avg        NUMERIC(3,2) DEFAULT NULL,       -- NULL until first rating received
  rating_count      INTEGER DEFAULT 0,
  verified_badge    BOOLEAN DEFAULT FALSE,
  stripe_identity_id TEXT DEFAULT NULL,              -- Stripe Identity session ID
  no_show_count     SMALLINT DEFAULT 0,
  cancel_flags      SMALLINT DEFAULT 0,              -- late cancellation strikes
  ban_until         TIMESTAMPTZ DEFAULT NULL,        -- NULL = not banned
  ban_permanent     BOOLEAN DEFAULT FALSE,
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','warned','suspended','deleted')),
  expo_push_token   TEXT DEFAULT NULL,
  warned_at         TIMESTAMPTZ DEFAULT NULL,        -- inactivity warning sent
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dim_user_status ON dim_user(status);
CREATE INDEX idx_dim_user_last_active ON dim_user(last_active_at);

-- ============================================================================
-- dim_quest (FKs to user, category, location, date)
-- ============================================================================
CREATE TABLE dim_quest (
  quest_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id          UUID NOT NULL REFERENCES dim_user(user_id),
  category_id         INTEGER NOT NULL REFERENCES dim_category(category_id),
  location_id         INTEGER NOT NULL REFERENCES dim_location(location_id),
  date_id             INTEGER NOT NULL REFERENCES dim_date(date_id),
  title               TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 80),
  description         TEXT NOT NULL CHECK (char_length(description) BETWEEN 20 AND 500),
  starts_at           TIMESTAMPTZ NOT NULL,
  max_participants    SMALLINT NOT NULL CHECK (max_participants BETWEEN 2 AND 20),
  current_count       SMALLINT NOT NULL DEFAULT 0,
  age_min             SMALLINT DEFAULT 18 CHECK (age_min >= 18),
  age_max             SMALLINT DEFAULT NULL,
  gender_restriction  TEXT NOT NULL DEFAULT 'all'
                      CHECK (gender_restriction IN ('all','women_only','men_only','non_binary_welcome')),
  cover_photo_url     TEXT DEFAULT NULL,
  stream_channel_id   TEXT DEFAULT NULL,             -- set when first member joins
  status              TEXT NOT NULL DEFAULT 'pending_review'
                      CHECK (status IN ('pending_review','active','full','cancelled','completed')),
  moderation_score    NUMERIC(3,2) DEFAULT NULL,     -- OpenAI confidence score
  moderation_reason   TEXT DEFAULT NULL,             -- rejection reason if human reviewed
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dim_quest_status ON dim_quest(status);
CREATE INDEX idx_dim_quest_starts_at ON dim_quest(starts_at);
CREATE INDEX idx_dim_quest_creator ON dim_quest(creator_id);
CREATE INDEX idx_dim_quest_category ON dim_quest(category_id);
