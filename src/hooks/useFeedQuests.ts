import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface FeedFilters {
  category?: string;
  radiusKm?: number;
  ageMin?: number;
  ageMax?: number;
  genderRestriction?: string;
}

export function useFeedQuests() {
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FeedFilters>({});

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('v_feed_quests').select('*');
    if (filters.category) query = query.eq('category', filters.category);
    const { data } = await query.order('starts_at', { ascending: true });
    setQuests(data ?? []);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return { quests, loading, refetch: fetch, filters, setFilters };
}
