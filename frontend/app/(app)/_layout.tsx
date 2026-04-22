import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/theme';
import { Text } from 'react-native';

export default function AppLayout() {
  const { session, initialized, hasProfile } = useAuthStore();

  if (!initialized) return null;
  if (!session) return <Redirect href="/(auth)/welcome" />;
  // Session exists but onboarding not done — send to profile setup
  if (!hasProfile) return <Redirect href="/(auth)/onboarding/profile-setup" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: Colors.background, borderTopColor: Colors.border },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tabs.Screen name="feed" options={{ title: 'Feed', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🗺</Text> }} />
      <Tabs.Screen name="create" options={{ title: 'Create', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>＋</Text> }} />
      <Tabs.Screen name="my-quests" options={{ title: 'My Quests', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚔️</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }} />
    </Tabs>
  );
}
