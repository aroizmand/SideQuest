import { View, Text, Image, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useBlockReport } from '@/hooks/useBlockReport';

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { profile, loading } = usePublicProfile(userId);
  const { block, report } = useBlockReport(userId);
  const router = useRouter();

  if (loading || !profile) return <View style={styles.center}><ActivityIndicator color="#FF5C00" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></Pressable>
      <Image source={{ uri: profile.photo_url }} style={styles.avatar} />
      <View style={styles.nameRow}>
        <Text style={styles.name}>{profile.first_name}</Text>
        {profile.verified_badge && <Text style={styles.badge}>✓ Verified</Text>}
      </View>
      <Text style={styles.meta}>{profile.age_range} · Member since {new Date(profile.member_since).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}</Text>
      {profile.rating_avg && <Text style={styles.rating}>★ {profile.rating_avg.toFixed(1)} · {profile.rating_count} ratings</Text>}

      <View style={styles.actions}>
        <Pressable style={styles.reportButton} onPress={() => report()}>
          <Text style={styles.reportText}>Report</Text>
        </Pressable>
        <Pressable style={styles.blockButton} onPress={() => block()}>
          <Text style={styles.blockText}>Block</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 24, paddingTop: 60, alignItems: 'center' },
  center: { flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginBottom: 24 },
  backText: { color: '#FF5C00', fontSize: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  badge: { fontSize: 12, color: '#FF5C00', fontWeight: '600', backgroundColor: '#1A1A1A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  meta: { color: '#666', fontSize: 13, marginBottom: 4 },
  rating: { color: '#FFB800', fontSize: 15, fontWeight: '600', marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  reportButton: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  reportText: { color: '#AAA', fontSize: 14 },
  blockButton: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#FF4444', alignItems: 'center' },
  blockText: { color: '#FF4444', fontSize: 14 },
});
