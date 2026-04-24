import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCategoriesStore } from '@/stores/categoriesStore';

export type { Category } from '@/stores/categoriesStore';

export function useCategories() {
  const { categories, setCategories } = useCategoriesStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Categories are static — only fetch if not already cached
    if (categories.length > 0) return;

    supabase
      .from('dim_category')
      .select('category_id, name, icon_slug')
      .eq('is_active', true)
      .order('name')
      .then(({ data, error }) => {
        if (error) { setError(error.message); return; }
        if (data) setCategories(data as Category[]);
      });
  }, []);

  return { categories, loading: categories.length === 0 && !error, error };
}
