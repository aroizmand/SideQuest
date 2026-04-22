import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types/user';

export function useOwnProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('dim_user')
      .select('user_id, first_name, photo_url, age, gender, rating_avg, rating_count, verified_badge, status, created_at, last_active_at')
      .eq('user_id', user.id)
      .single();

    setProfile((data as User) ?? null);
    setLoading(false);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  return { profile, loading, reload: load };
}
