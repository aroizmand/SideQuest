import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { streamClient } from '@/lib/stream';

export function useQuestManage(questId: string) {
  const [quest, setQuest] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('dim_quest').select('*').eq('quest_id', questId).single(),
      supabase.from('fact_quest_memberships').select('user_id, dim_user(first_name, photo_url)').eq('quest_id', questId).eq('is_creator', false).is('left_at', null),
    ]).then(([questRes, membersRes]) => {
      setQuest(questRes.data);
      setMembers((membersRes.data ?? []).map((m: any) => ({ user_id: m.user_id, ...m.dim_user })));
      setLoading(false);
    });
  }, [questId]);

  async function removeParticipant(userId: string) {
    await supabase.from('fact_quest_memberships').update({ left_at: new Date().toISOString() }).eq('quest_id', questId).eq('user_id', userId);
    if (quest?.stream_channel_id) {
      const channel = streamClient.channel('messaging', `quest_${questId}`);
      await channel.removeMembers([userId]);
    }
    setMembers(prev => prev.filter(m => m.user_id !== userId));
  }

  async function cancelQuest() {
    await supabase.from('dim_quest').update({ status: 'cancelled' }).eq('quest_id', questId);
  }

  return { quest, members, loading, removeParticipant, cancelQuest };
}
