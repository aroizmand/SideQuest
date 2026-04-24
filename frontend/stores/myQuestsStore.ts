import { create } from 'zustand';
import type { Quest } from '@/types/quest';

type StoredQuest = Quest & { is_creator?: boolean; is_past?: boolean };

type MyQuestsStore = {
  quests: StoredQuest[];
  setQuests: (quests: StoredQuest[]) => void;
};

export const useMyQuestsStore = create<MyQuestsStore>((set) => ({
  quests: [],
  setQuests: (quests) => set({ quests }),
}));
