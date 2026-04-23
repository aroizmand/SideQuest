import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type Participant = {
  user_id: string;
  first_name: string;
  photo_url: string;
  age: number;
  gender: string;
  joined_at: string;
};

export type QuestDetail = {
  quest_id: string;
  title: string;
  description: string;
  category: string;
  neighborhood: string;
  starts_at: string;
  max_participants: number;
  current_count: number;
  spots_left: number;
  status: string;
  gender_restriction: string;
  creator_id: string;
  creator_first_name: string;
  creator_photo_url: string;
  creator_age: number;
  creator_gender: string;
  creator_verified: boolean;
  participants: Participant[];
};

export function useQuestDetail(questId: string) {
  const [quest, setQuest] = useState<QuestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const { data: q } = await supabase
      .from('dim_quest')
      .select('*')
      .eq('quest_id', questId)
      .single();

    if (!q) { setLoading(false); return; }

    const [
      { data: creator },
      { data: category },
      { data: location },
      { data: memberRows },
    ] = await Promise.all([
      supabase.from('dim_user').select('first_name, photo_url, age, gender, verified_badge').eq('user_id', q.creator_id).single(),
      supabase.from('dim_category').select('name').eq('category_id', q.category_id).single(),
      supabase.from('dim_location').select('neighborhood').eq('location_id', q.location_id).single(),
      supabase.from('fact_quest_memberships').select('user_id, joined_at').eq('quest_id', questId).is('left_at', null).order('joined_at', { ascending: true }),
    ]);

    // Fetch participant profiles
    const userIds = (memberRows ?? []).map((m: any) => m.user_id);
    const { data: profiles } = userIds.length > 0
      ? await supabase.from('dim_user').select('user_id, first_name, photo_url, age, gender').in('user_id', userIds)
      : { data: [] };

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    const participants: Participant[] = (memberRows ?? []).map((m: any) => ({
      user_id: m.user_id,
      joined_at: m.joined_at,
      ...(profileMap.get(m.user_id) ?? { first_name: '?', photo_url: '', age: 0, gender: '' }),
    }));

    const current_count = participants.length;
    setQuest({
      quest_id: q.quest_id,
      title: q.title,
      description: q.description,
      category: (category as any)?.name ?? '',
      neighborhood: (location as any)?.neighborhood ?? '',
      starts_at: q.starts_at,
      max_participants: q.max_participants,
      current_count,
      spots_left: q.max_participants - current_count,
      status: q.status,
      gender_restriction: q.gender_restriction,
      creator_id: q.creator_id,
      creator_first_name: (creator as any)?.first_name ?? '',
      creator_photo_url: (creator as any)?.photo_url ?? '',
      creator_age: (creator as any)?.age ?? 0,
      creator_gender: (creator as any)?.gender ?? '',
      creator_verified: (creator as any)?.verified_badge ?? false,
      participants,
    });
    setLoading(false);
  }, [questId]);

  useEffect(() => { load(); }, [load]);

  return { quest, loading, reload: load };
}
