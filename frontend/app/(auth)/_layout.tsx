import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function AuthLayout() {
  const { session, initialized, hasProfile } = useAuthStore();

  if (!initialized) return null;
  // Only redirect to app if they have completed onboarding
  if (session && hasProfile) return <Redirect href="/(app)/feed" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
