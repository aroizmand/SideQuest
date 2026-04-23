import { create } from 'zustand';
import type { FeedQuest } from '@/types/quest';

type FeedStore = {
  quests: FeedQuest[];
  setQuests: (quests: FeedQuest[]) => void;
};

export const useFeedStore = create<FeedStore>((set) => ({
  quests: [],
  setQuests: (quests) => set({ quests }),
}));
