-- SideQuest Migration 003: Supporting Tables
-- Creates: reports, blocks, notification_log

-- ============================================================================
-- reports
-- ============================================================================
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

-- ============================================================================
-- blocks
-- ============================================================================
CREATE TABLE blocks (
  blocker_id    UUID NOT NULL REFERENCES dim_user(user_id),
  blocked_id    UUID NOT NULL REFERENCES dim_user(user_id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- ============================================================================
-- notification_log
-- ============================================================================
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
