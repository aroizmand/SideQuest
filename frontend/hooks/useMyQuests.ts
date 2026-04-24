import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useMyQuestsStore } from '@/stores/myQuestsStore';
import { useAuthStore } from '@/stores/authStore';
import type { Quest } from '@/types/quest';

export type MyQuest = Quest & { is_creator: boolean; is_past: boolean };

export function useMyQuests() {
  const { quests, setQuests } = useMyQuestsStore();
  const [loading, setLoading] = useState(quests.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else if (quests.length === 0) setLoading(true);

    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) { setLoading(false); setRefreshing(false); return; }

    const [{ data: created }, { data: memberships }] = await Promise.all([
      supabase.from('dim_quest').select('*').eq('creator_id', userId),
      supabase
        .from('fact_quest_memberships')
        .select('dim_quest(*)')
        .eq('user_id', userId)
        .is('left_at', null),
    ]);

    const now = Date.now();
    const createdMap = new Map<string, MyQuest>();
    (created ?? []).forEach((q: any) => {
      createdMap.set(q.quest_id, {
        ...q,
        is_creator: true,
        is_past: new Date(q.starts_at).getTime() < now,
      });
    });

    const joined: MyQuest[] = (memberships ?? [])
      .map((row: any) => row.dim_quest)
      .filter(Boolean)
      .filter((q: any) => !createdMap.has(q.quest_id))
      .map((q: any) => ({
        ...q,
        is_creator: false,
        is_past: new Date(q.starts_at).getTime() < now,
      }));

    const merged: MyQuest[] = [...createdMap.values(), ...joined].sort(
      (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    );

    setQuests(merged);
    setLoading(false);
    setRefreshing(false);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  return { quests: quests as MyQuest[], loading, refreshing, refresh: () => load(true) };
}
