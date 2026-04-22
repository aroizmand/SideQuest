import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { Quest } from '@/types/quest';

export function useMyQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); setRefreshing(false); return; }

    const [{ data: created }, { data: memberships }] = await Promise.all([
      supabase.from('dim_quest').select('*').eq('creator_id', user.id),
      supabase
        .from('fact_quest_memberships')
        .select('dim_quest(*)')
        .eq('user_id', user.id)
        .is('left_at', null),
    ]);

    const createdQuests = (created ?? []) as Quest[];
    const joinedQuests = (memberships ?? [])
      .map((row: any) => row.dim_quest)
      .filter(Boolean) as Quest[];

    // Merge, deduplicate, sort by date descending
    const seen = new Set(createdQuests.map((q) => q.quest_id));
    const merged = [
      ...createdQuests,
      ...joinedQuests.filter((q) => !seen.has(q.quest_id)),
    ].sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());

    setQuests(merged);
    setLoading(false);
    setRefreshing(false);
  }

  useFocusEffect(
    useCallback(() => { load(); }, [])
  );

  return { quests, loading, refreshing, refresh: () => load(true) };
}
