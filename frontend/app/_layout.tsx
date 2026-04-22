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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const hasProfile = session ? await checkHasProfile(session.user.id) : false;
      setInitialized(hasProfile);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const hasProfile = await checkHasProfile(session.user.id);
        setHasProfile(hasProfile);
      } else {
        setHasProfile(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
