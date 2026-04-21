import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { disconnectStreamUser } from '@/lib/stream';

interface AuthState {
  session: Session | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  initialize: () => () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initialized: false,

  setSession: (session) => set({ session }),

  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, initialized: true });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
    });

    return () => subscription.unsubscribe();
  },

  signOut: async () => {
    await disconnectStreamUser();
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
