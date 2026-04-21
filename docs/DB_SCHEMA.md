# SideQuest — Database Schema (Star Schema)

**Version:** 1.0 | **Date:** April 21, 2026
**Engine:** PostgreSQL (Supabase)

---

## 1. Star Schema Overview

The schema is organized around two central fact tables — `fact_quest_memberships` and `fact_ratings` — surrounded by dimension tables that describe users, quests, time, location, and categories.

```
                        ┌─────────────────┐
                        │   dim_category  │
                        │─────────────────│
                        │ PK category_id  │
                        │    name         │
                        │    icon_slug    │
                        │    is_active    │
                        └────────┬────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │              dim_quest               │
              │──────────────────────────────────────│
              │ PK  quest_id                         │
              │ FK  creator_id → dim_user            │
              │ FK  category_id → dim_category       │
              │ FK  location_id → dim_location       │
              │ FK  date_id → dim_date               │
              │     title, description               │
              │     max_participants                 │
              │     age_min, age_max                 │
              │     gender_restriction               │
              │     status, stream_channel_id        │
              │     cover_photo_url                  │
              │     moderation_score                 │
              └──────────┬───────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │                               │
┌────────▼────────────┐      ┌───────────▼──────────────┐
│ fact_quest_member-  │      │      fact_ratings         │
│      ships          │      │──────────────────────────│
│─────────────────────│      │ PK  rating_id             │
│ PK  membership_id   │      │ FK  from_user_id→dim_user │
│ FK  quest_id→dim_   │      │ FK  to_user_id → dim_user │
│     quest           │      │ FK  quest_id → dim_quest  │
│ FK  user_id→dim_    │      │ FK  date_id → dim_date    │
│     user            │      │     score (1-5)           │
│ FK  date_id→dim_    │      │     tags[]                │
│     date            │      │     created_at            │
│     joined_at       │      └──────────────────────────┘
│     left_at         │
│     attended        │           ┌──────────────────┐
│     no_show         │           │    dim_date       │
│     rating_given    │           │──────────────────│
└─────────────────────┘           │ PK date_id        │
                                  │    full_date       │
         ┌────────────────────────│    day_of_week     │
         │                        │    week_number     │
┌────────▼────────────┐           │    month           │
│      dim_user       │           │    quarter         │
│─────────────────────│           │    year            │
│ PK  user_id         │           │    is_weekend      │
│     phone_hash      │           └──────────────────┘
│     first_name      │
│     photo_url       │     ┌──────────────────────────┐
│     age             │     │      dim_location         │
│     gender          │     │──────────────────────────│
│     rating_avg      │     │ PK  location_id           │
│     verified_badge  │     │     neighborhood          │
│     no_show_count   │     │     city                  │
│     cancel_flags    │     │     province              │
│     status          │     │     lat (area centroid)   │
│     warned_at       │     │     lng (area centroid)   │
│     expo_push_token │     │     lat_exact             │
│     created_at      │     │     lng_exact             │
│     last_active_at  │     │     geohash               │
└─────────────────────┘     └──────────────────────────┘
```

---

## 2. Dimension Tables

### dim_user

```sql
CREATE TABLE dim_user (
  user_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash        TEXT UNIQUE NOT NULL,           -- SHA-256 of phone, never store raw
  first_name        TEXT NOT NULL,
  photo_url         TEXT NOT NULL,
  age               SMALLINT NOT NULL CHECK (age >= 18),
  gender            TEXT NOT NULL                   -- 'man','woman','non_binary','prefer_not_to_say'
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
```

### dim_quest

```sql
CREATE TABLE dim_quest (
  quest_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id          UUID NOT NULL REFERENCES dim_user(user_id),
  category_id         SMALLINT NOT NULL REFERENCES dim_category(category_id),
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
```

### dim_category

```sql
CREATE TABLE dim_category (
  category_id   SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  icon_slug     TEXT NOT NULL,               -- maps to icon set in app
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO dim_category (name, icon_slug) VALUES
  ('Hiking',                'hiking'),
  ('Trail Running',         'trail-running'),
  ('Cycling',               'cycling'),
  ('Watersports',           'watersports'),
  ('Winter Sports',         'winter-sports'),
  ('Climbing',              'climbing'),
  ('Urban Exploration',     'urban-exploration'),
  ('Fitness & Workout',     'fitness'),
  ('Food Adventure',        'food-adventure'),
  ('Photography Walk',      'photography'),
  ('Travel & Day Trip',     'travel'),
  ('Outdoor Arts & Culture','arts-outdoor'),
  ('Motorsports',           'motorsports'),
  ('Other Adventure',       'other');
```

### dim_location

```sql
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

-- PostGIS extension for advanced geo queries (optional, add in Phase 2)
-- ALTER TABLE dim_location ADD COLUMN geom GEOGRAPHY(POINT, 4326);
```

### dim_date

```sql
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

-- Pre-populate 3 years (script at scripts/seed_dim_date.sql)
```

---

## 3. Fact Tables

### fact_quest_memberships

```sql
CREATE TABLE fact_quest_memberships (
  membership_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id        UUID NOT NULL REFERENCES dim_quest(quest_id),
  user_id         UUID NOT NULL REFERENCES dim_user(user_id),
  date_id         INTEGER NOT NULL REFERENCES dim_date(date_id),  -- date joined
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at         TIMESTAMPTZ DEFAULT NULL,
  attended        BOOLEAN DEFAULT NULL,   -- NULL = not yet confirmed
  no_show         BOOLEAN DEFAULT NULL,
  rating_given    BOOLEAN DEFAULT FALSE,  -- has this user submitted ratings for quest
  is_creator      BOOLEAN NOT NULL DEFAULT FALSE,

  UNIQUE (quest_id, user_id)              -- one membership per user per quest
);

CREATE INDEX idx_membership_quest ON fact_quest_memberships(quest_id);
CREATE INDEX idx_membership_user  ON fact_quest_memberships(user_id);
CREATE INDEX idx_membership_date  ON fact_quest_memberships(date_id);
```

### fact_ratings

```sql
CREATE TABLE fact_ratings (
  rating_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id    UUID NOT NULL REFERENCES dim_user(user_id),
  to_user_id      UUID NOT NULL REFERENCES dim_user(user_id),
  quest_id        UUID NOT NULL REFERENCES dim_quest(quest_id),
  date_id         INTEGER NOT NULL REFERENCES dim_date(date_id),
  score           SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  tags            TEXT[] DEFAULT '{}',   -- 'showed_up','great_energy','felt_safe','no_show'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (from_user_id != to_user_id),
  UNIQUE (from_user_id, to_user_id, quest_id)  -- one rating per pair per quest
);

CREATE INDEX idx_rating_to_user  ON fact_ratings(to_user_id);
CREATE INDEX idx_rating_quest    ON fact_ratings(quest_id);
CREATE INDEX idx_rating_date     ON fact_ratings(date_id);
```

---

## 4. Supporting Tables (operational, not star schema)

### reports

```sql
CREATE TABLE reports (
  report_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id       UUID NOT NULL REFERENCES dim_user(user_id),
  reported_user_id  UUID REFERENCES dim_user(user_id),
  reported_quest_id UUID REFERENCES dim_quest(quest_id),
  category          TEXT NOT NULL
                    CHECK (category IN ('fake_identity','inappropriate_content','unsafe_behavior','spam','other')),
  description       TEXT DEFAULT NULL,
  status            TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','reviewed','actioned','dismissed')),
  reviewed_by       UUID DEFAULT NULL,   -- admin user_id
  reviewed_at       TIMESTAMPTZ DEFAULT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (reported_user_id IS NOT NULL OR reported_quest_id IS NOT NULL)
);

CREATE INDEX idx_reports_status ON reports(status);
```

### blocks

```sql
CREATE TABLE blocks (
  blocker_id    UUID NOT NULL REFERENCES dim_user(user_id),
  blocked_id    UUID NOT NULL REFERENCES dim_user(user_id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);
```

### notification_log

```sql
CREATE TABLE notification_log (
  notification_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES dim_user(user_id),
  type              TEXT NOT NULL,        -- 'quest_joined','quest_reminder','rating_prompt', etc.
  payload           JSONB DEFAULT '{}',
  sent_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered         BOOLEAN DEFAULT NULL  -- updated by Expo push receipt check
);

CREATE INDEX idx_notif_user ON notification_log(user_id);
CREATE INDEX idx_notif_sent ON notification_log(sent_at);
```

---

## 5. Key Views

### v_feed_quests
Materializes the public feed — excludes exact location, filters out full/cancelled/joined quests per user.

```sql
CREATE VIEW v_feed_quests AS
SELECT
  q.quest_id,
  q.title,
  q.description,
  c.name           AS category,
  c.icon_slug,
  q.starts_at,
  l.neighborhood,
  l.lat_area,
  l.lng_area,
  q.max_participants,
  q.current_count,
  (q.max_participants - q.current_count) AS spots_left,
  q.age_min,
  q.age_max,
  q.gender_restriction,
  q.cover_photo_url,
  u.first_name     AS creator_first_name,
  u.photo_url      AS creator_photo_url,
  u.rating_avg     AS creator_rating,
  u.verified_badge AS creator_verified
FROM dim_quest q
JOIN dim_category c ON q.category_id = c.category_id
JOIN dim_location l ON q.location_id = l.location_id
JOIN dim_user     u ON q.creator_id  = u.user_id
WHERE q.status = 'active'
  AND q.starts_at > NOW()
  AND q.starts_at <= NOW() + INTERVAL '72 hours';
-- RLS policy on this view additionally filters:
--   blocked users, already-joined quests, gender/age mismatch
```

### v_user_public_profile
Safe public-facing user data — no phone, no internal flags.

```sql
CREATE VIEW v_user_public_profile AS
SELECT
  user_id,
  first_name,
  photo_url,
  CASE
    WHEN age BETWEEN 18 AND 24 THEN '18-24'
    WHEN age BETWEEN 25 AND 29 THEN '25-29'
    WHEN age BETWEEN 30 AND 34 THEN '30-34'
    WHEN age BETWEEN 35 AND 39 THEN '35-39'
    WHEN age BETWEEN 40 AND 49 THEN '40s'
    ELSE '50+'
  END                   AS age_range,
  rating_avg,
  rating_count,
  verified_badge,
  created_at::DATE      AS member_since
FROM dim_user
WHERE status = 'active';
```

---

## 6. RLS Policy Summary

| Table | Policy | Rule |
|---|---|---|
| `dim_user` | SELECT own full row | `user_id = auth.uid()` |
| `dim_user` | SELECT others | Only via `v_user_public_profile` |
| `dim_quest` | SELECT | Status = active AND starts_at within 72h AND not blocked |
| `dim_quest` | INSERT | Authenticated, not banned |
| `dim_location` | SELECT lat_exact / address_text | Only if `membership exists` for requesting user |
| `fact_quest_memberships` | SELECT | `user_id = auth.uid()` OR `quest creator_id = auth.uid()` |
| `fact_ratings` | SELECT | `to_user_id = auth.uid()` (own ratings only) |
| `reports` | INSERT | Authenticated users |
| `reports` | SELECT | Admin role only |
| `blocks` | SELECT/INSERT/DELETE | `blocker_id = auth.uid()` |

---

## 7. Automated Jobs (pg_cron)

```sql
-- Post-quest rating trigger: runs every 15 minutes
SELECT cron.schedule('rating-trigger', '*/15 * * * *',
  $$SELECT trigger_post_quest_ratings()$$);

-- Inactivity warning: every Monday 00:00 UTC
SELECT cron.schedule('inactivity-warn', '0 0 * * 1',
  $$SELECT send_inactivity_warnings()$$);

-- Inactivity deletion: every Monday 01:00 UTC
SELECT cron.schedule('inactivity-delete', '0 1 * * 1',
  $$SELECT anonymize_inactive_users()$$);

-- Quest status updater: every 5 minutes
-- marks started quests as 'completed', freezes Stream channels
SELECT cron.schedule('quest-status-update', '*/5 * * * *',
  $$SELECT update_quest_statuses()$$);

-- Expo push receipt check: every hour
SELECT cron.schedule('push-receipt-check', '0 * * * *',
  $$SELECT check_push_receipts()$$);
```

---

## 8. Analytics Queries (example star schema usage)

### Quests completed per category per week
```sql
SELECT
  dc.name          AS category,
  dd.week_number,
  dd.year,
  COUNT(*)         AS quests_completed
FROM dim_quest q
JOIN dim_category dc ON q.category_id = dc.category_id
JOIN dim_date     dd ON q.date_id = dd.date_id
WHERE q.status = 'completed'
GROUP BY dc.name, dd.week_number, dd.year
ORDER BY dd.year, dd.week_number;
```

### Average rating by category
```sql
SELECT
  dc.name          AS category,
  ROUND(AVG(r.score), 2) AS avg_rating,
  COUNT(r.rating_id)     AS total_ratings
FROM fact_ratings r
JOIN dim_quest    q  ON r.quest_id    = q.quest_id
JOIN dim_category dc ON q.category_id = dc.category_id
GROUP BY dc.name
ORDER BY avg_rating DESC;
```

### No-show rate by day of week
```sql
SELECT
  dd.day_of_week,
  COUNT(*) FILTER (WHERE m.no_show = TRUE)  AS no_shows,
  COUNT(*)                                   AS total_attendances,
  ROUND(
    COUNT(*) FILTER (WHERE m.no_show = TRUE)::NUMERIC
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                          AS no_show_pct
FROM fact_quest_memberships m
JOIN dim_date dd ON m.date_id = dd.date_id
WHERE m.attended IS NOT NULL
GROUP BY dd.day_of_week, dd.day_number
ORDER BY dd.day_number;
```
