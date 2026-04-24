import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export type PastQuest = {
  quest_id: string;
  title: string;
  starts_at: string;
  category: string;
  participant_count: number;
};

export function usePastQuests() {
  const [quests, setQuests] = useState<PastQuest[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) { setLoading(false); return; }

    const now = new Date().toISOString();

    const [{ data: created }, { data: memberships }] = await Promise.all([
      supabase
        .from('dim_quest')
        .select('quest_id, title, starts_at, current_count, dim_category(name)')
        .eq('creator_id', userId)
        .lt('starts_at', now)
        .order('starts_at', { ascending: false }),
      supabase
        .from('fact_quest_memberships')
        .select('dim_quest(quest_id, title, starts_at, current_count, dim_category(name))')
        .eq('user_id', userId)
        .is('left_at', null),
    ]);

    const createdQuests: PastQuest[] = (created ?? []).map((q: any) => ({
      quest_id: q.quest_id,
      title: q.title,
      starts_at: q.starts_at,
      category: q.dim_category?.name ?? '',
      participant_count: q.current_count,
    }));

    const joinedQuests: PastQuest[] = (memberships ?? [])
      .map((m: any) => m.dim_quest)
      .filter((q: any) => q && new Date(q.starts_at) < new Date())
      .map((q: any) => ({
        quest_id: q.quest_id,
        title: q.title,
        starts_at: q.starts_at,
        category: q.dim_category?.name ?? '',
        participant_count: q.current_count,
      }));

    const seen = new Set(createdQuests.map((q) => q.quest_id));
    const merged = [
      ...createdQuests,
      ...joinedQuests.filter((q) => !seen.has(q.quest_id)),
    ].sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());

    setQuests(merged);
    setLoading(false);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  return { quests, loading };
}
