import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export function useMyQuests() {
  const [created, setCreated] = useState<any[]>([]);
  const [joined, setJoined] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuthStore();

  useEffect(() => {
    if (!session) return;
    Promise.all([
      supabase.from('v_feed_quests').select('*').eq('creator_id', session.user.id),
      supabase
        .from('fact_quest_memberships')
        .select('quest_id, v_feed_quests(*)')
        .eq('user_id', session.user.id)
        .eq('is_creator', false)
        .is('left_at', null),
    ]).then(([createdRes, joinedRes]) => {
      setCreated(createdRes.data ?? []);
      setJoined((joinedRes.data ?? []).map((m: any) => m['v_feed_quests']).filter(Boolean));
      setLoading(false);
    });
  }, [session]);

  return { created, joined, loading };
}
