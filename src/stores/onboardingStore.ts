import { create } from 'zustand';

interface OnboardingState {
  photoUri: string | null;
  firstName: string | null;
  age: number | null;
  gender: string | null;
  setPhoto: (uri: string) => void;
  setProfile: (profile: { firstName: string; age: number; gender: string }) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  photoUri: null,
  firstName: null,
  age: null,
  gender: null,
  setPhoto: (uri) => set({ photoUri: uri }),
  setProfile: ({ firstName, age, gender }) => set({ firstName, age, gender }),
  reset: () => set({ photoUri: null, firstName: null, age: null, gender: null }),
}));
