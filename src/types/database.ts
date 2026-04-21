// Auto-generate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
// This is a placeholder — replace after Supabase project is initialized.

export type Database = {
  public: {
    Tables: {
      dim_user: {
        Row: {
          user_id: string;
          phone_hash: string;
          first_name: string;
          photo_url: string;
          age: number;
          gender: string;
          rating_avg: number | null;
          rating_count: number;
          verified_badge: boolean;
          stripe_identity_id: string | null;
          no_show_count: number;
          cancel_flags: number;
          ban_until: string | null;
          ban_permanent: boolean;
          status: 'active' | 'warned' | 'suspended' | 'deleted';
          expo_push_token: string | null;
          warned_at: string | null;
          created_at: string;
          last_active_at: string;
        };
        Insert: Partial<Database['public']['Tables']['dim_user']['Row']> & {
          user_id: string;
          first_name: string;
          photo_url: string;
          age: number;
          gender: string;
        };
        Update: Partial<Database['public']['Tables']['dim_user']['Row']>;
      };
      dim_quest: {
        Row: {
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
          age_min: number;
          age_max: number | null;
          gender_restriction: 'all' | 'women_only' | 'men_only' | 'non_binary_welcome';
          cover_photo_url: string | null;
          stream_channel_id: string | null;
          status: 'pending_review' | 'active' | 'full' | 'cancelled' | 'completed';
          moderation_score: number | null;
          moderation_reason: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['dim_quest']['Row'], 'quest_id' | 'current_count' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['dim_quest']['Row']>;
      };
      fact_quest_memberships: {
        Row: {
          membership_id: string;
          quest_id: string;
          user_id: string;
          date_id: number;
          joined_at: string;
          left_at: string | null;
          attended: boolean | null;
          no_show: boolean | null;
          rating_given: boolean;
          is_creator: boolean;
        };
        Insert: Omit<Database['public']['Tables']['fact_quest_memberships']['Row'], 'membership_id' | 'joined_at'>;
        Update: Partial<Database['public']['Tables']['fact_quest_memberships']['Row']>;
      };
      fact_ratings: {
        Row: {
          rating_id: string;
          from_user_id: string;
          to_user_id: string;
          quest_id: string;
          date_id: number;
          score: number;
          tags: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fact_ratings']['Row'], 'rating_id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['fact_ratings']['Row']>;
      };
    };
    Views: {
      v_feed_quests: {
        Row: {
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
          age_min: number;
          age_max: number | null;
          gender_restriction: string;
          cover_photo_url: string | null;
          creator_first_name: string;
          creator_photo_url: string;
          creator_rating: number | null;
          creator_verified: boolean;
        };
      };
    };
  };
};
