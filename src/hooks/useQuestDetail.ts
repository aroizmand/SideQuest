import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useQuestDetail(questId: string) {
  const [quest, setQuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('v_feed_quests')
      .select('*')
      .eq('quest_id', questId)
      .single()
      .then(({ data }) => { setQuest(data); setLoading(false); });
  }, [questId]);

  return { quest, loading };
}
