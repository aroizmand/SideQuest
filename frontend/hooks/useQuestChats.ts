import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export type QuestChatPreview = {
  quest_id: string;
  title: string;
  category: string | null;
  last_message: string | null;
  last_message_at: string | null;
  last_sender: string | null;
};

export function useQuestChats() {
  const [chats, setChats] = useState<QuestChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const userId = useAuthStore.getState().session?.user.id;
    if (!userId) { setLoading(false); return; }

    const [{ data: created }, { data: memberships }] = await Promise.all([
      supabase.from('dim_quest').select('quest_id, title, dim_category(name)').eq('creator_id', userId),
      supabase
        .from('fact_quest_memberships')
        .select('dim_quest(quest_id, title, dim_category(name))')
        .eq('user_id', userId)
        .is('left_at', null),
    ]);

    const mapQuest = (q: any) => ({
      quest_id: q.quest_id,
      title: q.title,
      category: q.dim_category?.name ?? null,
    });

    const allQuests = [
      ...(created ?? []).map(mapQuest),
      ...(memberships ?? []).map((m: any) => m.dim_quest).filter(Boolean).map(mapQuest),
    ];

    const seen = new Set<string>();
    const uniqueQuests = allQuests.filter(q => {
      if (seen.has(q.quest_id)) return false;
      seen.add(q.quest_id);
      return true;
    });

    if (uniqueQuests.length === 0) { setChats([]); setLoading(false); return; }

    const questIds = uniqueQuests.map(q => q.quest_id);

    const { data: recentMsgs } = await supabase
      .from('quest_messages')
      .select('quest_id, body, created_at, user_id')
      .in('quest_id', questIds)
      .order('created_at', { ascending: false })
      .limit(questIds.length * 5);

    const lastMsg = new Map<string, { body: string; created_at: string; user_id: string }>();
    for (const m of recentMsgs ?? []) {
      if (!lastMsg.has(m.quest_id)) lastMsg.set(m.quest_id, m);
    }

    const senderIds = [...new Set([...lastMsg.values()].map(m => m.user_id))];
    const { data: senders } = senderIds.length > 0
      ? await supabase.from('v_user_public_profile').select('user_id, first_name').in('user_id', senderIds)
      : { data: [] };
    const senderMap = new Map((senders ?? []).map(s => [s.user_id, s.first_name]));

    const previews: QuestChatPreview[] = uniqueQuests
      .map(q => {
        const msg = lastMsg.get(q.quest_id);
        return {
          quest_id: q.quest_id,
          title: q.title,
          category: q.category,
          last_message: msg?.body ?? null,
          last_message_at: msg?.created_at ?? null,
          last_sender: msg
            ? msg.user_id === userId ? 'You' : (senderMap.get(msg.user_id) ?? null)
            : null,
        };
      })
      .sort((a, b) => {
        const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return tb - ta;
      });

    setChats(previews);
    setLoading(false);
  }

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, []));

  return { chats, loading };
}
