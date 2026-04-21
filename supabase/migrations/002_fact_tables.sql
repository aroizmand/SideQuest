-- SideQuest Migration 002: Fact Tables
-- Creates: fact_quest_memberships, fact_ratings

-- ============================================================================
-- fact_quest_memberships
-- ============================================================================
CREATE TABLE fact_quest_memberships (
  membership_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id        UUID NOT NULL REFERENCES dim_quest(quest_id) ON DELETE CASCADE,
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

-- ============================================================================
-- fact_ratings
-- ============================================================================
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
