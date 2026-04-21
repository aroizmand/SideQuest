import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export function useOwnProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuthStore();

  useEffect(() => {
    if (!session) return;
    supabase
      .from('v_user_public_profile')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => { setProfile(data); setLoading(false); });
  }, [session]);

  return { profile, loading };
}
