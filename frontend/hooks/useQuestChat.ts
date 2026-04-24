import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

export type ChatMessage = {
  message_id: string;
  user_id: string;
  body: string;
  created_at: string;
  sender_name: string;
  sender_photo: string | null;
};

export function useQuestChat(questId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const myUserId = useAuthStore.getState().session?.user.id ?? null;
  // Cache sender profiles so we don't refetch on every realtime event
  const senderCache = useRef<Record<string, { sender_name: string; sender_photo: string | null }>>({});

  async function resolveProfile(userId: string): Promise<{ sender_name: string; sender_photo: string | null }> {
    if (senderCache.current[userId]) return senderCache.current[userId];

    if (userId === myUserId) {
      const p = useProfileStore.getState().profile;
      const entry = { sender_name: p?.first_name ?? 'Me', sender_photo: p?.photo_url ?? null };
      senderCache.current[userId] = entry;
      return entry;
    }

    const { data } = await supabase
      .from('v_user_public_profile')
      .select('first_name, photo_url')
      .eq('user_id', userId)
      .single();
    const entry = { sender_name: data?.first_name ?? 'Unknown', sender_photo: data?.photo_url ?? null };
    senderCache.current[userId] = entry;
    return entry;
  }

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('quest_messages')
        .select('message_id, user_id, body, created_at')
        .eq('quest_id', questId)
        .order('created_at', { ascending: true })
        .limit(200);

      if (!active) return;
      if (!data) { setLoading(false); return; }

      const uniqueIds = [...new Set(data.map(m => m.user_id))];
      await Promise.all(uniqueIds.map(resolveProfile));

      setMessages(data.map(m => ({ ...m, ...senderCache.current[m.user_id] })));
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel(`quest-chat-${questId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'quest_messages', filter: `quest_id=eq.${questId}` },
        async (payload) => {
          if (!active) return;
          const profile = await resolveProfile(payload.new.user_id);
          setMessages(prev => {
            if (prev.some(m => m.message_id === payload.new.message_id)) return prev;
            return [...prev, {
              message_id: payload.new.message_id,
              user_id: payload.new.user_id,
              body: payload.new.body,
              created_at: payload.new.created_at,
              ...profile,
            }];
          });
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [questId]);

  async function sendMessage(body: string): Promise<boolean> {
    const trimmed = body.trim();
    if (!trimmed) return false;
    // Re-read session at send time — it may have expired since mount
    const currentUserId = useAuthStore.getState().session?.user.id;
    if (!currentUserId) return false;
    setSending(true);
    const { error } = await supabase.from('quest_messages').insert({
      quest_id: questId,
      user_id: currentUserId,
      body: trimmed,
    });
    setSending(false);
    return !error;
  }

  return { messages, loading, sending, sendMessage, myUserId: myUserId ?? '' };
}
