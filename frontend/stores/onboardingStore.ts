import { create } from 'zustand';
import type { Gender } from '@/types/user';

type OnboardingState = {
  phone: string;
  firstName: string;
  age: string;
  gender: Gender | '';
  setPhone: (phone: string) => void;
  setProfile: (firstName: string, age: string, gender: Gender) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  phone: '',
  firstName: '',
  age: '',
  gender: '',
  setPhone: (phone) => set({ phone }),
  setProfile: (firstName, age, gender) => set({ firstName, age, gender }),
  reset: () => set({ phone: '', firstName: '', age: '', gender: '' }),
}));
