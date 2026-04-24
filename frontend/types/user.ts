export type Gender = 'man' | 'woman' | 'non_binary' | 'prefer_not_to_say';
export type UserStatus = 'active' | 'warned' | 'suspended' | 'deleted';

// Matches dim_user table (own profile only — RLS restricts reading others)
export type User = {
  user_id: string;
  first_name: string;
  photo_url: string | null;
  bio: string | null;
  age: number;
  gender: Gender;
  rating_avg: number | null;
  rating_count: number;
  verified_badge: boolean;
  status: UserStatus;
  expo_push_token: string | null;
  created_at: string;
  last_active_at: string;
};

// Matches v_user_public_profile view (used for reading other users)
export type PublicProfile = {
  user_id: string;
  first_name: string;
  photo_url: string | null;
  bio: string | null;
  age: number;
  gender: Gender;
  rating_avg: number | null;
  rating_count: number;
  verified_badge: boolean;
  member_since: string;
};
