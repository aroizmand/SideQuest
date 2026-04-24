import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { PublicProfile } from '@/types/user';

export function usePublicProfile(userId: string) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      const { data } = await supabase
        .from('v_user_public_profile')
        .select('user_id, first_name, photo_url, bio, age, gender, rating_avg, rating_count, verified_badge, member_since')
        .eq('user_id', userId)
        .single();
      setProfile((data as PublicProfile) ?? null);
      setLoading(false);
    }
    load();
  }, [userId]);

  return { profile, loading };
}
