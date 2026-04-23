import { create } from 'zustand';
import type { Quest } from '@/types/quest';

type MyQuestsStore = {
  quests: Quest[];
  setQuests: (quests: Quest[]) => void;
};

export const useMyQuestsStore = create<MyQuestsStore>((set) => ({
  quests: [],
  setQuests: (quests) => set({ quests }),
}));
