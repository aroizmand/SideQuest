import { create } from 'zustand';
import type { FeedQuest } from '@/types/quest';

type FeedStore = {
  quests: FeedQuest[];
  setQuests: (quests: FeedQuest[]) => void;
  // radius in km; 100 means no distance filter ("Any")
  radius: number;
  setRadius: (r: number) => void;
  userCity: string;
  setUserCity: (city: string) => void;
};

export const useFeedStore = create<FeedStore>((set) => ({
  quests: [],
  setQuests: (quests) => set({ quests }),
  radius: 25,
  setRadius: (radius) => set({ radius }),
  userCity: '',
  setUserCity: (userCity) => set({ userCity }),
}));
