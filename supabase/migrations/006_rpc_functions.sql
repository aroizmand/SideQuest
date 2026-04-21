-- SideQuest Migration 006: RPC Functions
-- Creates: join_quest, leave_quest, create_quest_with_location, get_date_id, update_user_rating

-- ============================================================================
-- Helper: Get or create date_id for a given date
-- ============================================================================
CREATE OR REPLACE FUNCTION get_date_id(target_date DATE)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  result_id INTEGER;
BEGIN
  result_id := TO_CHAR(target_date, 'YYYYMMDD')::INTEGER;

  -- Insert if not exists (should already exist from seed, but safety)
  INSERT INTO dim_date (date_id, full_date, day_of_week, day_number, week_number, month, month_number, quarter, year, is_weekend)
  VALUES (
    result_id,
    target_date,
    TO_CHAR(target_date, 'Day'),
    EXTRACT(ISODOW FROM target_date)::SMALLINT,
    EXTRACT(WEEK FROM target_date)::SMALLINT,
    TO_CHAR(target_date, 'Month'),
    EXTRACT(MONTH FROM target_date)::SMALLINT,
    EXTRACT(QUARTER FROM target_date)::SMALLINT,
    EXTRACT(YEAR FROM target_date)::SMALLINT,
    EXTRACT(ISODOW FROM target_date) IN (6, 7)
  )
  ON CONFLICT (date_id) DO NOTHING;

  RETURN result_id;
END;
$$;

-- ============================================================================
-- join_quest RPC
-- Validates eligibility and creates membership
-- ============================================================================
CREATE OR REPLACE FUNCTION join_quest(p_quest_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_quest RECORD;
  v_user RECORD;
  v_date_id INTEGER;
  v_membership_id UUID;
BEGIN
  -- Get quest details
  SELECT * INTO v_quest FROM dim_quest WHERE quest_id = p_quest_id;

  IF v_quest IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quest not found');
  END IF;

  -- Check quest is active and open
  IF v_quest.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quest is not available');
  END IF;

  IF v_quest.current_count >= v_quest.max_participants THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quest is full');
  END IF;

  -- Get user details
  SELECT * INTO v_user FROM dim_user WHERE user_id = v_user_id;

  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Check user is not banned
  IF v_user.status != 'active' OR (v_user.ban_until IS NOT NULL AND v_user.ban_until > NOW()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Your account is restricted');
  END IF;

  -- Check age eligibility
  IF v_quest.age_min IS NOT NULL AND v_user.age < v_quest.age_min THEN
    RETURN jsonb_build_object('success', false, 'error', 'You do not meet the age requirement');
  END IF;

  IF v_quest.age_max IS NOT NULL AND v_user.age > v_quest.age_max THEN
    RETURN jsonb_build_object('success', false, 'error', 'You do not meet the age requirement');
  END IF;

  -- Check gender restriction
  IF v_quest.gender_restriction != 'all' THEN
    IF v_quest.gender_restriction = 'women_only' AND v_user.gender != 'woman' THEN
      RETURN jsonb_build_object('success', false, 'error', 'This quest is for women only');
    END IF;
    IF v_quest.gender_restriction = 'men_only' AND v_user.gender != 'man' THEN
      RETURN jsonb_build_object('success', false, 'error', 'This quest is for men only');
    END IF;
  END IF;

  -- Check not already a member
  IF EXISTS (SELECT 1 FROM fact_quest_memberships WHERE quest_id = p_quest_id AND user_id = v_user_id AND left_at IS NULL) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already joined this quest');
  END IF;

  -- Check not blocked by creator
  IF EXISTS (SELECT 1 FROM blocks WHERE blocker_id = v_quest.creator_id AND blocked_id = v_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You cannot join this quest');
  END IF;

  -- All checks passed - create membership
  v_date_id := get_date_id(CURRENT_DATE);

  INSERT INTO fact_quest_memberships (quest_id, user_id, date_id, is_creator)
  VALUES (p_quest_id, v_user_id, v_date_id, false)
  RETURNING membership_id INTO v_membership_id;

  -- Update quest count
  UPDATE dim_quest
  SET current_count = current_count + 1,
      status = CASE WHEN current_count + 1 >= max_participants THEN 'full' ELSE status END
  WHERE quest_id = p_quest_id;

  -- Update user last_active
  UPDATE dim_user SET last_active_at = NOW() WHERE user_id = v_user_id;

  -- Return success with exact location (revealed on join)
  RETURN jsonb_build_object(
    'success', true,
    'membership_id', v_membership_id,
    'location', (
      SELECT jsonb_build_object(
        'lat_exact', l.lat_exact,
        'lng_exact', l.lng_exact,
        'address_text', l.address_text
      )
      FROM dim_location l
      WHERE l.location_id = v_quest.location_id
    )
  );
END;
$$;

-- ============================================================================
-- leave_quest RPC
-- ============================================================================
CREATE OR REPLACE FUNCTION leave_quest(p_quest_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_quest RECORD;
  v_membership RECORD;
BEGIN
  -- Get membership
  SELECT * INTO v_membership
  FROM fact_quest_memberships
  WHERE quest_id = p_quest_id AND user_id = v_user_id AND left_at IS NULL;

  IF v_membership IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are not in this quest');
  END IF;

  -- Creators cannot leave their own quest
  IF v_membership.is_creator THEN
    RETURN jsonb_build_object('success', false, 'error', 'Creators cannot leave. Cancel the quest instead.');
  END IF;

  -- Get quest to check timing
  SELECT * INTO v_quest FROM dim_quest WHERE quest_id = p_quest_id;

  -- Mark as left
  UPDATE fact_quest_memberships
  SET left_at = NOW()
  WHERE membership_id = v_membership.membership_id;

  -- Decrement count and potentially reopen quest
  UPDATE dim_quest
  SET current_count = current_count - 1,
      status = CASE WHEN status = 'full' THEN 'active' ELSE status END
  WHERE quest_id = p_quest_id;

  -- Late cancellation flag (within 24h of start)
  IF v_quest.starts_at - NOW() < INTERVAL '24 hours' THEN
    UPDATE dim_user
    SET cancel_flags = cancel_flags + 1
    WHERE user_id = v_user_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================================
-- create_quest_with_location RPC
-- Creates location and quest in one transaction
-- ============================================================================
CREATE OR REPLACE FUNCTION create_quest_with_location(
  p_title TEXT,
  p_description TEXT,
  p_category_id INTEGER,
  p_starts_at TIMESTAMPTZ,
  p_max_participants SMALLINT,
  p_age_min SMALLINT DEFAULT 18,
  p_age_max SMALLINT DEFAULT NULL,
  p_gender_restriction TEXT DEFAULT 'all',
  p_cover_photo_url TEXT DEFAULT NULL,
  p_neighborhood TEXT DEFAULT 'Downtown',
  p_lat_area NUMERIC DEFAULT 51.0447,
  p_lng_area NUMERIC DEFAULT -114.0719,
  p_lat_exact NUMERIC DEFAULT 51.0447,
  p_lng_exact NUMERIC DEFAULT -114.0719,
  p_address_text TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_location_id INTEGER;
  v_quest_id UUID;
  v_date_id INTEGER;
  v_geohash TEXT;
BEGIN
  -- Check user exists and is active
  IF NOT EXISTS (SELECT 1 FROM dim_user WHERE user_id = v_user_id AND status = 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found or inactive');
  END IF;

  -- Validate starts_at is within 72 hours
  IF p_starts_at < NOW() OR p_starts_at > NOW() + INTERVAL '72 hours' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quest must start within the next 72 hours');
  END IF;

  -- Generate simple geohash (first 5 chars approximation)
  v_geohash := SUBSTRING(MD5(p_lat_exact::TEXT || p_lng_exact::TEXT), 1, 5);

  -- Create location
  INSERT INTO dim_location (neighborhood, lat_area, lng_area, lat_exact, lng_exact, geohash, address_text)
  VALUES (p_neighborhood, p_lat_area, p_lng_area, p_lat_exact, p_lng_exact, v_geohash, p_address_text)
  RETURNING location_id INTO v_location_id;

  -- Get date_id
  v_date_id := get_date_id(p_starts_at::DATE);

  -- Create quest (starts as pending_review - Edge Function will moderate and activate)
  INSERT INTO dim_quest (
    creator_id, category_id, location_id, date_id, title, description,
    starts_at, max_participants, age_min, age_max, gender_restriction, cover_photo_url,
    status
  )
  VALUES (
    v_user_id, p_category_id, v_location_id, v_date_id, p_title, p_description,
    p_starts_at, p_max_participants, p_age_min, p_age_max, p_gender_restriction, p_cover_photo_url,
    'pending_review'
  )
  RETURNING quest_id INTO v_quest_id;

  -- Auto-add creator as first member
  INSERT INTO fact_quest_memberships (quest_id, user_id, date_id, is_creator)
  VALUES (v_quest_id, v_user_id, v_date_id, true);

  -- Update quest count
  UPDATE dim_quest SET current_count = 1 WHERE quest_id = v_quest_id;

  -- Update user last_active
  UPDATE dim_user SET last_active_at = NOW() WHERE user_id = v_user_id;

  RETURN jsonb_build_object('success', true, 'quest_id', v_quest_id);
END;
$$;

-- ============================================================================
-- update_user_rating (called after ratings are submitted)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE dim_user
  SET
    rating_avg = (
      SELECT ROUND(AVG(score)::NUMERIC, 2)
      FROM fact_ratings
      WHERE to_user_id = NEW.to_user_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM fact_ratings
      WHERE to_user_id = NEW.to_user_id
    )
  WHERE user_id = NEW.to_user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_user_rating
AFTER INSERT ON fact_ratings
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();

-- ============================================================================
-- Grant execute permissions
-- ============================================================================
GRANT EXECUTE ON FUNCTION get_date_id TO authenticated;
GRANT EXECUTE ON FUNCTION join_quest TO authenticated;
GRANT EXECUTE ON FUNCTION leave_quest TO authenticated;
GRANT EXECUTE ON FUNCTION create_quest_with_location TO authenticated;
