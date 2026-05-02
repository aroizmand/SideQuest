-- SideQuest Migration 011: Broader categories
-- Replaces 14 granular categories with 7 broad ones.
-- Dummy quests (b0000001-* UUIDs) are deleted and re-seeded with valid category refs.

-- 1. Clear in FK dependency order
DELETE FROM fact_ratings;
DELETE FROM fact_quest_memberships;
DELETE FROM dim_quest;

-- 2. Swap categories
DELETE FROM dim_category;
INSERT INTO dim_category (name, icon_slug) VALUES
  ('Outdoors',        'outdoors'),
  ('Sports & Fitness','sports'),
  ('Food & Drinks',   'food'),
  ('Arts & Culture',  'arts'),
  ('Travel & Explore','travel'),
  ('Social',          'social'),
  ('Other',           'other');

-- 3. Re-seed dummy quests against the new categories
WITH locs AS (SELECT location_id, neighborhood FROM dim_location)
INSERT INTO dim_quest
  (quest_id, creator_id, category_id, location_id, date_id, title, description,
   starts_at, max_participants, current_count, status)
VALUES
  (
    'b0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000001',
    (SELECT category_id FROM dim_category WHERE name = 'Outdoors'),
    (SELECT location_id FROM locs WHERE neighborhood = 'Nose Hill Park'),
    TO_CHAR(NOW() + INTERVAL '4 hours', 'YYYYMMDD')::INTEGER,
    'Sunrise Hike at Nose Hill',
    'Early morning hike to catch the sunrise over the city. Easy to moderate terrain, about 8km round trip. Bring layers and water.',
    NOW() + INTERVAL '4 hours', 4, 1, 'active'
  ),
  (
    'b0000001-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000002',
    (SELECT category_id FROM dim_category WHERE name = 'Arts & Culture'),
    (SELECT location_id FROM locs WHERE neighborhood = 'Inglewood'),
    TO_CHAR(NOW() + INTERVAL '1 day', 'YYYYMMDD')::INTEGER,
    'Golden Hour Shoot in Inglewood',
    'Exploring Inglewood at golden hour — old buildings, murals, and the river. Bring any camera. All skill levels welcome, this is just for fun.',
    NOW() + INTERVAL '1 day', 5, 2, 'active'
  ),
  (
    'b0000001-0000-0000-0000-000000000003',
    'a0000001-0000-0000-0000-000000000003',
    (SELECT category_id FROM dim_category WHERE name = 'Food & Drinks'),
    (SELECT location_id FROM locs WHERE neighborhood = 'Mission'),
    TO_CHAR(NOW() + INTERVAL '1 day 6 hours', 'YYYYMMDD')::INTEGER,
    'Mission Brunch Crawl',
    'Hitting 2-3 spots along 4th St for brunch. We''ll decide on the day based on wait times. Budget around $25. Good vibes only.',
    NOW() + INTERVAL '1 day 6 hours', 4, 2, 'active'
  ),
  (
    'b0000001-0000-0000-0000-000000000004',
    'a0000001-0000-0000-0000-000000000004',
    (SELECT category_id FROM dim_category WHERE name = 'Sports & Fitness'),
    (SELECT location_id FROM locs WHERE neighborhood = 'Eau Claire'),
    TO_CHAR(NOW() + INTERVAL '2 days', 'YYYYMMDD')::INTEGER,
    'Riverside Workout Circuit',
    'Outdoor HIIT circuit along the Bow River pathway. Bring a mat and water. 45 min session followed by a cool-down walk. All fitness levels welcome.',
    NOW() + INTERVAL '2 days', 6, 3, 'active'
  ),
  (
    'b0000001-0000-0000-0000-000000000005',
    'a0000001-0000-0000-0000-000000000005',
    (SELECT category_id FROM dim_category WHERE name = 'Outdoors'),
    (SELECT location_id FROM locs WHERE neighborhood = 'Fish Creek Park'),
    TO_CHAR(NOW() + INTERVAL '2 days 8 hours', 'YYYYMMDD')::INTEGER,
    'Fish Creek Gravel Ride',
    'Gravel ride through Fish Creek Park, roughly 25km. Medium pace — not a race. Road bikes or hybrids welcome. Meeting at the main parking lot.',
    NOW() + INTERVAL '2 days 8 hours', 5, 1, 'active'
  ),
  (
    'b0000001-0000-0000-0000-000000000006',
    'a0000001-0000-0000-0000-000000000001',
    (SELECT category_id FROM dim_category WHERE name = 'Social'),
    (SELECT location_id FROM locs WHERE neighborhood = 'Kensington'),
    TO_CHAR(NOW() + INTERVAL '2 days 12 hours', 'YYYYMMDD')::INTEGER,
    'Kensington Bar Hop',
    'Casual bar hop through Kensington — 3 spots, 1 drink each. No pressure, just meeting new people. Must be 18+.',
    NOW() + INTERVAL '2 days 12 hours', 6, 4, 'active'
  ),
  (
    'b0000001-0000-0000-0000-000000000007',
    'a0000001-0000-0000-0000-000000000002',
    (SELECT category_id FROM dim_category WHERE name = 'Outdoors'),
    (SELECT location_id FROM locs WHERE neighborhood = 'Winsport / COP'),
    TO_CHAR(NOW() + INTERVAL '3 days', 'YYYYMMDD')::INTEGER,
    'COP Trails Morning Run',
    'Trail run on the beginner/intermediate paths at Canada Olympic Park. About 5km. Relaxed pace, more of a social jog. Meet at the main entrance.',
    NOW() + INTERVAL '3 days', 4, 2, 'active'
  ),
  (
    'b0000001-0000-0000-0000-000000000008',
    'a0000001-0000-0000-0000-000000000003',
    (SELECT category_id FROM dim_category WHERE name = 'Arts & Culture'),
    (SELECT location_id FROM locs WHERE neighborhood = 'Marda Loop'),
    TO_CHAR(NOW() + INTERVAL '3 days 4 hours', 'YYYYMMDD')::INTEGER,
    'Marda Loop Art Walk',
    'Walking tour of public art and galleries in Marda Loop. About 2 hours, ending with coffee. No art knowledge needed — just curiosity.',
    NOW() + INTERVAL '3 days 4 hours', 5, 1, 'active'
  )
ON CONFLICT (quest_id) DO NOTHING;

-- 4. Re-seed memberships
INSERT INTO fact_quest_memberships (quest_id, user_id, date_id, is_creator)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', TO_CHAR(NOW() + INTERVAL '4 hours',        'YYYYMMDD')::INTEGER, true),
  ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', TO_CHAR(NOW() + INTERVAL '1 day',           'YYYYMMDD')::INTEGER, true),
  ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', TO_CHAR(NOW() + INTERVAL '1 day 6 hours',   'YYYYMMDD')::INTEGER, true),
  ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', TO_CHAR(NOW() + INTERVAL '2 days',          'YYYYMMDD')::INTEGER, true),
  ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', TO_CHAR(NOW() + INTERVAL '2 days 8 hours',  'YYYYMMDD')::INTEGER, true),
  ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000001', TO_CHAR(NOW() + INTERVAL '2 days 12 hours', 'YYYYMMDD')::INTEGER, true),
  ('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000002', TO_CHAR(NOW() + INTERVAL '3 days',          'YYYYMMDD')::INTEGER, true),
  ('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000003', TO_CHAR(NOW() + INTERVAL '3 days 4 hours',  'YYYYMMDD')::INTEGER, true),
  ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000004', TO_CHAR(NOW() + INTERVAL '1 day',           'YYYYMMDD')::INTEGER, false),
  ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000005', TO_CHAR(NOW() + INTERVAL '1 day 6 hours',   'YYYYMMDD')::INTEGER, false),
  ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', TO_CHAR(NOW() + INTERVAL '2 days',          'YYYYMMDD')::INTEGER, false),
  ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000002', TO_CHAR(NOW() + INTERVAL '2 days',          'YYYYMMDD')::INTEGER, false),
  ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000002', TO_CHAR(NOW() + INTERVAL '2 days 12 hours', 'YYYYMMDD')::INTEGER, false),
  ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000003', TO_CHAR(NOW() + INTERVAL '2 days 12 hours', 'YYYYMMDD')::INTEGER, false),
  ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000005', TO_CHAR(NOW() + INTERVAL '2 days 12 hours', 'YYYYMMDD')::INTEGER, false)
ON CONFLICT (quest_id, user_id) DO NOTHING;
