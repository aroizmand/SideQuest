import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

interface CreateQuestParams {
  title: string;
  description: string;
  category: string;
  startsAt: string;
  maxParticipants: number;
  ageMin: number;
  ageMax: number | null;
  genderRestriction: string;
}

export function useCreateQuest() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuthStore();

  async function create(params: CreateQuestParams) {
    if (!session) return null;
    setCreating(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc('create_quest', {
      p_creator_id: session.user.id,
      p_title: params.title,
      p_description: params.description,
      p_category_name: params.category,
      p_starts_at: params.startsAt,
      p_max_participants: params.maxParticipants,
      p_age_min: params.ageMin,
      p_age_max: params.ageMax,
      p_gender_restriction: params.genderRestriction,
    });

    setCreating(false);
    if (rpcError) { setError(rpcError.message); return null; }
    return data;
  }

  return { create, creating, error };
}
