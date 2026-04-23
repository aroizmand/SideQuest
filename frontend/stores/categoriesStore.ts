import { create } from 'zustand';

export type Category = {
  category_id: number;
  name: string;
  icon_slug: string;
};

type CategoriesStore = {
  categories: Category[];
  setCategories: (cats: Category[]) => void;
};

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
}));
