-- SideQuest Migration 004: Views
-- Creates: v_feed_quests, v_user_public_profile

-- ============================================================================
-- v_feed_quests
-- Materializes the public feed — excludes exact location
-- ============================================================================
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
  q.creator_id,
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

-- ============================================================================
-- v_user_public_profile
-- Safe public-facing user data — no phone, no internal flags
-- ============================================================================
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
