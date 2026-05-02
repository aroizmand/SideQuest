-- SideQuest Migration 009: Fix v_feed_quests
-- Adds city, creator_age, creator_gender (were in FeedQuest type but missing from view)

DROP VIEW IF EXISTS v_feed_quests;
CREATE VIEW v_feed_quests AS
SELECT
  q.quest_id,
  q.title,
  q.description,
  c.name           AS category,
  c.icon_slug,
  q.starts_at,
  l.neighborhood,
  l.city,
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
  u.age            AS creator_age,
  u.gender         AS creator_gender,
  u.rating_avg     AS creator_rating,
  u.verified_badge AS creator_verified
FROM dim_quest q
JOIN dim_category c ON q.category_id = c.category_id
JOIN dim_location l ON q.location_id = l.location_id
JOIN dim_user     u ON q.creator_id  = u.user_id
WHERE q.status = 'active'
  AND q.starts_at > NOW()
  AND q.starts_at <= NOW() + INTERVAL '72 hours';
