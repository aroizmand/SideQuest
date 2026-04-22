import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Quest } from '@/types/quest';

export type CreateQuestInput = {
  title: string;
  description: string;
  neighborhood: string;
  starts_at: string;           // ISO string
  max_participants: number;
  category_id: number;
  gender_restriction?: string;
  age_min?: number;
  age_max?: number;
};

// Returns the date_id integer key (YYYYMMDD) for a given ISO date string
function toDateId(isoString: string): number {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return parseInt(`${y}${m}${day}`, 10);
}

// Find existing location by neighborhood name, or create one with Calgary defaults
async function resolveLocationId(neighborhood: string): Promise<number | null> {
  const { data: existing } = await supabase
    .from('dim_location')
    .select('location_id')
    .ilike('neighborhood', neighborhood.trim())
    .limit(1)
    .single();

  if (existing) return existing.location_id;

  // Insert with Calgary city-centre defaults — replace with geocoding later
  const { data: created, error } = await supabase
    .from('dim_location')
    .insert({
      neighborhood: neighborhood.trim(),
      city: 'Calgary',
      province: 'AB',
      country: 'CA',
      lat_area: 51.0447,
      lng_area: -114.0719,
      lat_exact: 51.0447,
      lng_exact: -114.0719,
      geohash: 'c3nfv',
    })
    .select('location_id')
    .single();

  if (error) { console.error(error); return null; }
  return created.location_id;
}

export function useCreateQuest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createQuest(input: CreateQuestInput): Promise<Quest | null> {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); setError('Not signed in.'); return null; }

    const location_id = await resolveLocationId(input.neighborhood);
    if (!location_id) { setLoading(false); setError('Could not resolve location.'); return null; }

    const date_id = toDateId(input.starts_at);

    const { data, error: insertError } = await supabase
      .from('dim_quest')
      .insert({
        creator_id: user.id,
        category_id: input.category_id,
        location_id,
        date_id,
        title: input.title,
        description: input.description,
        starts_at: input.starts_at,
        max_participants: input.max_participants,
        gender_restriction: input.gender_restriction ?? 'all',
        age_min: input.age_min ?? 18,
        age_max: input.age_max ?? null,
        status: 'active',
      })
      .select()
      .single();

    setLoading(false);
    if (insertError) { console.error(insertError); setError(insertError.message); return null; }
    return data as Quest;
  }

  return { createQuest, loading, error };
}
