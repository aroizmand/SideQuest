import { useState } from 'react';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import type { Quest } from '@/types/quest';

export type CreateQuestInput = {
  title: string;
  description: string;
  neighborhood: string;
  address_text?: string;       // full address, revealed on join
  lat_exact: number;
  lng_exact: number;
  lat_area: number;
  lng_area: number;
  starts_at: string;           // ISO string
  max_participants: number;
  category_id: number;
  gender_restriction?: string;
  age_min?: number;
  age_max?: number;
};

async function ensureDateId(isoString: string): Promise<number | null> {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const target = `${y}-${m}-${day}`;
  const { data, error } = await supabase.rpc('ensure_date_id', { target_date: target });
  if (error) return null;
  return data as number;
}

async function createLocation(input: CreateQuestInput): Promise<number | null> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.MD5,
    `${input.lat_exact}${input.lng_exact}`
  );
  const { data, error } = await supabase
    .from('dim_location')
    .insert({
      neighborhood: input.neighborhood.trim(),
      city: 'Calgary',
      province: 'AB',
      country: 'CA',
      lat_area: input.lat_area,
      lng_area: input.lng_area,
      lat_exact: input.lat_exact,
      lng_exact: input.lng_exact,
      geohash: hash.substring(0, 5),
      address_text: input.address_text ?? null,
    })
    .select('location_id')
    .single();

  if (error) return null;
  return data.location_id;
}

export function useCreateQuest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createQuest(input: CreateQuestInput): Promise<Quest | null> {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); setError('Not signed in.'); return null; }

    const [location_id, date_id] = await Promise.all([
      createLocation(input),
      ensureDateId(input.starts_at),
    ]);

    if (!location_id) { setLoading(false); setError('Could not save location.'); return null; }
    if (!date_id) { setLoading(false); setError('Could not resolve date.'); return null; }

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
    if (insertError) { setError(insertError.message); return null; }
    return data as Quest;
  }

  return { createQuest, loading, error };
}
