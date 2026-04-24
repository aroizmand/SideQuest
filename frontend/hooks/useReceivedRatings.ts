import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type ReceivedRating = {
  rating_id: string;
  score: number;
  tags: string[];
  created_at: string;
  from_first_name: string;
  from_photo_url: string | null;
  quest_title: string;
};

export function useReceivedRatings(userId: string | undefined) {
  const [ratings, setRatings] = useState<ReceivedRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    async function load() {
      const { data } = await supabase
        .from('fact_ratings')
        .select('rating_id, score, tags, created_at, from_user_id, quest_id')
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) { setRatings([]); setLoading(false); return; }

      const fromIds = [...new Set(data.map((r: any) => r.from_user_id))];
      const questIds = [...new Set(data.map((r: any) => r.quest_id))];

      const [{ data: profiles }, { data: quests }] = await Promise.all([
        supabase.from('v_user_public_profile').select('user_id, first_name, photo_url').in('user_id', fromIds),
        supabase.from('dim_quest').select('quest_id, title').in('quest_id', questIds),
      ]);

      const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
      const questMap = new Map((quests ?? []).map((q: any) => [q.quest_id, q]));

      setRatings(data.map((r: any) => ({
        rating_id: r.rating_id,
        score: r.score,
        tags: r.tags ?? [],
        created_at: r.created_at,
        from_first_name: profileMap.get(r.from_user_id)?.first_name ?? '?',
        from_photo_url: profileMap.get(r.from_user_id)?.photo_url ?? null,
        quest_title: questMap.get(r.quest_id)?.title ?? '',
      })));
      setLoading(false);
    }
    load();
  }, [userId]);

  return { ratings, loading };
}
