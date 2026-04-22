export type QuestStatus = 'pending_review' | 'active' | 'full' | 'cancelled' | 'completed';

// Matches v_feed_quests view
export type FeedQuest = {
  quest_id: string;
  title: string;
  description: string;
  category: string;
  icon_slug: string;
  starts_at: string;
  neighborhood: string;
  lat_area: number;
  lng_area: number;
  max_participants: number;
  current_count: number;
  spots_left: number;
  age_min: number | null;
  age_max: number | null;
  gender_restriction: string;
  cover_photo_url: string | null;
  creator_id: string;
  creator_first_name: string;
  creator_photo_url: string;
  creator_rating: number | null;
  creator_verified: boolean;
};

// Matches dim_quest table
export type Quest = {
  quest_id: string;
  creator_id: string;
  category_id: number;
  location_id: number;
  date_id: number;
  title: string;
  description: string;
  starts_at: string;
  max_participants: number;
  current_count: number;
  status: QuestStatus;
  gender_restriction: string;
  age_min: number | null;
  age_max: number | null;
  cover_photo_url: string | null;
  created_at: string;
};
