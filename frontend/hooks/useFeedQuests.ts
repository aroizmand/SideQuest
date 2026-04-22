import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { FeedQuest } from '@/types/quest';

export function useFeedQuests() {
  const [quests, setQuests] = useState<FeedQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const { data } = await supabase
      .from('v_feed_quests')
      .select('*')
      .order('starts_at', { ascending: true });

    setQuests((data as FeedQuest[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  }

  useFocusEffect(
    useCallback(() => { load(); }, [])
  );

  return { quests, loading, refreshing, refresh: () => load(true) };
}
