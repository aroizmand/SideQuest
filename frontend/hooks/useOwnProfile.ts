import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useProfileStore } from '@/stores/profileStore';
import type { User } from '@/types/user';

export function useOwnProfile() {
  const { profile, setProfile } = useProfileStore();
  // Only show a spinner on the very first load when there's nothing cached yet
  const [loading, setLoading] = useState(!profile);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('dim_user')
      .select('user_id, first_name, photo_url, bio, age, gender, rating_avg, rating_count, verified_badge, status, created_at, last_active_at')
      .eq('user_id', user.id)
      .single();

    if (data) setProfile(data as User);
    setLoading(false);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  return { profile, loading, reload: load };
}
