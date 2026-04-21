import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';

export function useJoinQuest(questId: string) {
  const [joining, setJoining] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const { session } = useAuthStore();
  const router = useRouter();

  async function join() {
    if (!session) return;
    setJoining(true);
    setEligibilityError(null);

    const { error } = await supabase.rpc('join_quest', { p_quest_id: questId, p_user_id: session.user.id });

    setJoining(false);
    if (error) {
      setEligibilityError(error.message);
      return;
    }
    router.replace(`/(app)/my-quests/quest/${questId}/chat`);
  }

  return { join, joining, eligibilityError };
}
