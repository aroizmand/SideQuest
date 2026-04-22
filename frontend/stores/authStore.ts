import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  initialized: boolean;
  hasProfile: boolean;
  setSession: (session: Session | null) => void;
  setInitialized: (hasProfile: boolean) => void;
  setHasProfile: (has: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initialized: false,
  hasProfile: false,
  setSession: (session) => set({ session }),
  setInitialized: (hasProfile) => set({ initialized: true, hasProfile }),
  setHasProfile: (hasProfile) => set({ hasProfile }),
}));
