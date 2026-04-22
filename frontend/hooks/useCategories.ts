import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type Category = {
  category_id: number;
  name: string;
  icon_slug: string;
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('dim_category')
      .select('category_id, name, icon_slug')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        setCategories((data as Category[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}
