import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types/user';

export function usePublicProfile(userId: string) {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      const { data } = await supabase
        .from('dim_user')
        .select('*')
        .eq('user_id', userId)
        .single();
      setProfile((data as User) ?? null);
      setLoading(false);
    }
    load();
  }, [userId]);

  return { profile, loading };
}
