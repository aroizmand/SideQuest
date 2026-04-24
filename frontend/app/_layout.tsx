import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

async function checkHasProfile(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('dim_user')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

export default function RootLayout() {
  const { setSession, setInitialized, setHasProfile } = useAuthStore();

  useEffect(() => {
    let lastCheckedUserId: string | null = null;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const hasProfile = session ? await checkHasProfile(session.user.id) : false;
      lastCheckedUserId = session?.user.id ?? null;
      setInitialized(hasProfile);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (!session) {
        lastCheckedUserId = null;
        setHasProfile(false);
        return;
      }
      // Only re-check profile if the user actually changed (skip TOKEN_REFRESHED, etc.)
      if (session.user.id === lastCheckedUserId) return;
      lastCheckedUserId = session.user.id;
      const hasProfile = await checkHasProfile(session.user.id);
      setHasProfile(hasProfile);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
