import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function usePublicProfile(userId: string) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('v_user_public_profile')
      .select('*')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => { setProfile(data); setLoading(false); });
  }, [userId]);

  return { profile, loading };
}
