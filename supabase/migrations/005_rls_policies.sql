-- SideQuest Migration 005: Row Level Security Policies
-- Enables RLS and creates access policies for all tables

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================
ALTER TABLE dim_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_quest ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_date ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_quest_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- dim_user policies
-- ============================================================================
-- Users can read their own full profile
CREATE POLICY "Users can read own profile"
  ON dim_user FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON dim_user FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- dim_category policies (public read)
-- ============================================================================
CREATE POLICY "Categories are publicly readable"
  ON dim_category FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================================
-- dim_date policies (public read)
-- ============================================================================
CREATE POLICY "Dates are publicly readable"
  ON dim_date FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- dim_location policies
-- ============================================================================
-- Area coordinates are public (for feed map)
CREATE POLICY "Location area coords are readable"
  ON dim_location FOR SELECT
  TO authenticated
  USING (true);

-- Note: lat_exact/lng_exact access is controlled at query level in RPCs

-- ============================================================================
-- dim_quest policies
-- ============================================================================
-- Read active quests (with block filtering done at view/RPC level)
CREATE POLICY "Read active quests"
  ON dim_quest FOR SELECT
  TO authenticated
  USING (
    status IN ('active', 'full', 'completed')
    OR creator_id = auth.uid()
  );

-- Authenticated users can create quests
CREATE POLICY "Authenticated users can create quests"
  ON dim_quest FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Creators can update their own quests
CREATE POLICY "Creators can update own quests"
  ON dim_quest FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid());

-- ============================================================================
-- fact_quest_memberships policies
-- ============================================================================
-- Users can see memberships for quests they're in or created
CREATE POLICY "Read own memberships or as creator"
  ON fact_quest_memberships FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR quest_id IN (
      SELECT quest_id FROM dim_quest WHERE creator_id = auth.uid()
    )
  );

-- Users can insert their own membership (joining)
CREATE POLICY "Users can join quests"
  ON fact_quest_memberships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own membership (leaving, rating_given)
CREATE POLICY "Users can update own membership"
  ON fact_quest_memberships FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- fact_ratings policies
-- ============================================================================
-- Users can see ratings about themselves
CREATE POLICY "Users can read ratings about them"
  ON fact_ratings FOR SELECT
  TO authenticated
  USING (to_user_id = auth.uid());

-- Users can insert ratings
CREATE POLICY "Users can create ratings"
  ON fact_ratings FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth.uid());

-- ============================================================================
-- reports policies
-- ============================================================================
-- Anyone can create a report
CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Users can see their own reports
CREATE POLICY "Users can see own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

-- ============================================================================
-- blocks policies
-- ============================================================================
-- Users can manage their own blocks
CREATE POLICY "Users can read own blocks"
  ON blocks FOR SELECT
  TO authenticated
  USING (blocker_id = auth.uid());

CREATE POLICY "Users can create blocks"
  ON blocks FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can delete own blocks"
  ON blocks FOR DELETE
  TO authenticated
  USING (blocker_id = auth.uid());

-- ============================================================================
-- notification_log policies
-- ============================================================================
CREATE POLICY "Users can read own notifications"
  ON notification_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- v_feed_quests view security (inherits from underlying tables)
-- ============================================================================
-- The view automatically filters through RLS on dim_quest
-- Additional filtering for blocks is done in the RPC

-- ============================================================================
-- v_user_public_profile view security
-- ============================================================================
-- Grant select on view to authenticated users
GRANT SELECT ON v_user_public_profile TO authenticated;
GRANT SELECT ON v_feed_quests TO authenticated;
