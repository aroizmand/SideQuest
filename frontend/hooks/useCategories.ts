import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCategoriesStore } from '@/stores/categoriesStore';

export type { Category } from '@/stores/categoriesStore';

export function useCategories() {
  const { categories, setCategories } = useCategoriesStore();

  useEffect(() => {
    // Categories are static — only fetch if not already cached
    if (categories.length > 0) return;

    supabase
      .from('dim_category')
      .select('category_id, name, icon_slug')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data as Category[]);
      });
  }, []);

  return { categories, loading: categories.length === 0 };
}
