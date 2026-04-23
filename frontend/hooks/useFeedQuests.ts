import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useFeedStore } from '@/stores/feedStore';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import type { FeedQuest, ParticipantPreview } from '@/types/quest';

export function useFeedQuests() {
  const { quests, setQuests } = useFeedStore();
  const [loading, setLoading] = useState(quests.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else if (quests.length === 0) setLoading(true);

    const userId = useAuthStore.getState().session?.user.id;
    const cachedGender = useProfileStore.getState().profile?.gender ?? null;

    const genderPromise: Promise<string | null> = cachedGender
      ? Promise.resolve(cachedGender)
      : userId
        ? supabase.from('dim_user').select('gender').eq('user_id', userId).single()
            .then(({ data }) => data?.gender ?? null)
        : Promise.resolve(null);

    const [userGender, { data }] = await Promise.all([
      genderPromise,
      supabase.from('v_feed_quests').select('*').order('starts_at', { ascending: true }),
    ]);

    const all = (data as FeedQuest[]) ?? [];
    const visible = userGender
      ? all.filter(q => q.gender_restriction === 'all' || q.gender_restriction === userGender)
      : all.filter(q => q.gender_restriction === 'all');

    // Batch-fetch participants for all visible quests (2 extra queries for the whole feed)
    const questIds = visible.map(q => q.quest_id);
    let participantsByQuest = new Map<string, ParticipantPreview[]>();

    if (questIds.length > 0) {
      const { data: memberRows } = await supabase
        .from('fact_quest_memberships')
        .select('quest_id, user_id')
        .in('quest_id', questIds)
        .is('left_at', null);

      const memberData = (memberRows ?? []) as { quest_id: string; user_id: string }[];
      const participantIds = [...new Set(memberData.map(m => m.user_id))];

      if (participantIds.length > 0) {
        const { data: profiles } = await supabase
          .from('dim_user')
          .select('user_id, first_name, photo_url, age')
          .in('user_id', participantIds);

        const profileMap = new Map(
          (profiles ?? []).map((p: any) => [p.user_id, p as ParticipantPreview])
        );

        for (const m of memberData) {
          const p = profileMap.get(m.user_id);
          if (!p) continue;
          if (!participantsByQuest.has(m.quest_id)) participantsByQuest.set(m.quest_id, []);
          const list = participantsByQuest.get(m.quest_id)!;
          if (list.length < 6) list.push(p);
        }
      }
    }

    setQuests(visible.map(q => ({
      ...q,
      participants: participantsByQuest.get(q.quest_id) ?? [],
    })));
    setLoading(false);
    setRefreshing(false);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  return { quests, loading, refreshing, refresh: () => load(true) };
}
