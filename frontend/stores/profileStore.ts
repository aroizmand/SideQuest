import { create } from 'zustand';
import type { User } from '@/types/user';

type ProfileStore = {
  profile: User | null;
  setProfile: (p: User | null) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
