import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export function useQuestMembership(questId: string) {
  // Read from in-memory store — instant, no network call, avoids null race condition
  const userId = useAuthStore.getState().session?.user.id ?? null;

  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  async function check() {
    if (!userId) { setLoading(false); return; }

    const [{ data: membership }, { data: quest }] = await Promise.all([
      supabase
        .from('fact_quest_memberships')
        .select('user_id')
        .eq('quest_id', questId)
        .eq('user_id', userId)
        .is('left_at', null)
        .maybeSingle(),
      supabase
        .from('dim_quest')
        .select('creator_id')
        .eq('quest_id', questId)
        .single(),
    ]);

    setIsMember(!!membership);
    setIsCreator((quest as any)?.creator_id === userId);
    setLoading(false);
  }

  useEffect(() => { check(); }, [questId]);

  async function join() {
    if (!userId) return;
    setActing(true);

    const { data: existing } = await supabase
      .from('fact_quest_memberships')
      .select('user_id')
      .eq('quest_id', questId)
      .eq('user_id', userId)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('fact_quest_memberships')
        .update({ left_at: null })
        .eq('quest_id', questId)
        .eq('user_id', userId));
    } else {
      const today = new Date();
      const target = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const { data: dateId, error: dateErr } = await supabase.rpc('ensure_date_id', { target_date: target });
      if (dateErr || !dateId) {
        setActing(false);
        return dateErr ?? new Error('Could not resolve date');
      }
      ({ error } = await supabase
        .from('fact_quest_memberships')
        .insert({ quest_id: questId, user_id: userId, date_id: dateId }));
    }

    // Only update local state if the DB operation actually succeeded
    if (!error) setIsMember(true);
    setActing(false);
    return error ?? null;
  }

  async function leave() {
    if (!userId) return;
    setActing(true);
    const { error } = await supabase
      .from('fact_quest_memberships')
      .update({ left_at: new Date().toISOString() })
      .eq('quest_id', questId)
      .eq('user_id', userId)
      .is('left_at', null);
    if (!error) setIsMember(false);
    setActing(false);
    return error ?? null;
  }

  async function deleteQuest() {
    if (!userId) return null;
    setActing(true);
    const { error } = await supabase
      .from('dim_quest')
      .delete()
      .eq('quest_id', questId)
      .eq('creator_id', userId);
    setActing(false);
    return error ?? null;
  }

  return { isMember, isCreator, loading, acting, join, leave, deleteQuest };
}
