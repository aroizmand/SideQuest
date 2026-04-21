import { View, Text, Image, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useOwnProfile } from '@/hooks/useOwnProfile';

export default function ProfileScreen() {
  const { profile, loading } = useOwnProfile();
  const { signOut } = useAuthStore();
  const router = useRouter();

  if (loading || !profile) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: profile.photo_url }} style={styles.avatar} />
      <View style={styles.nameRow}>
        <Text style={styles.name}>{profile.first_name}</Text>
        {profile.verified_badge && <Text style={styles.badge}>✓ Verified</Text>}
      </View>
      <Text style={styles.meta}>Member since {new Date(profile.member_since).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}</Text>
      {profile.rating_avg && (
        <Text style={styles.rating}>★ {profile.rating_avg.toFixed(1)} · {profile.rating_count} ratings</Text>
      )}
      <Text style={styles.questCount}>{profile.quest_count ?? 0} quests completed</Text>

      <View style={styles.divider} />

      {!profile.verified_badge && (
        <Pressable style={styles.verifyButton} onPress={() => router.push('/(app)/profile/verify-id')}>
          <Text style={styles.verifyText}>Get Verified Badge</Text>
        </Pressable>
      )}

      <Pressable style={styles.menuItem} onPress={() => router.push('/(app)/profile/settings')}>
        <Text style={styles.menuItemText}>Settings</Text>
      </Pressable>

      <Pressable style={styles.menuItem} onPress={signOut}>
        <Text style={[styles.menuItemText, { color: '#FF4444' }]}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 24, paddingTop: 60, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  badge: { fontSize: 12, color: '#FF5C00', fontWeight: '600', backgroundColor: '#1A1A1A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  meta: { color: '#666', fontSize: 13, marginBottom: 4 },
  rating: { color: '#FFB800', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  questCount: { color: '#AAA', fontSize: 14, marginBottom: 24 },
  divider: { width: '100%', height: 1, backgroundColor: '#1A1A1A', marginBottom: 24 },
  verifyButton: { width: '100%', backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#FF5C00', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  verifyText: { color: '#FF5C00', fontWeight: '700', fontSize: 15 },
  menuItem: { width: '100%', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  menuItemText: { color: '#FFF', fontSize: 16 },
});
