import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuestDetail } from '@/hooks/useQuestDetail';
import { useJoinQuest } from '@/hooks/useJoinQuest';

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quest, loading } = useQuestDetail(id);
  const { join, joining, eligibilityError } = useJoinQuest(id);
  const router = useRouter();

  if (loading || !quest) {
    return <View style={styles.center}><ActivityIndicator color="#FF5C00" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.category}>{quest.category}</Text>
      <Text style={styles.title}>{quest.title}</Text>
      <Text style={styles.meta}>{quest.neighborhood} · {new Date(quest.starts_at).toLocaleString()}</Text>
      <Text style={styles.meta}>{quest.spots_left} spots left of {quest.max_participants}</Text>
      <Text style={styles.description}>{quest.description}</Text>

      {eligibilityError && <Text style={styles.error}>{eligibilityError}</Text>}

      <Pressable
        style={[styles.joinButton, (joining || !!eligibilityError) && styles.joinButtonDisabled]}
        onPress={join}
        disabled={joining || !!eligibilityError}
      >
        {joining
          ? <ActivityIndicator color="#FFF" />
          : <Text style={styles.joinButtonText}>Join Quest</Text>
        }
      </Pressable>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 24, paddingTop: 60 },
  center: { flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' },
  category: { color: '#FF5C00', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  meta: { color: '#888', fontSize: 14, marginBottom: 4 },
  description: { color: '#CCC', fontSize: 16, lineHeight: 24, marginTop: 16, marginBottom: 32 },
  error: { color: '#FF4444', marginBottom: 16, fontSize: 14 },
  joinButton: { backgroundColor: '#FF5C00', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  joinButtonDisabled: { opacity: 0.4 },
  joinButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  backButton: { alignItems: 'center', paddingVertical: 12 },
  backText: { color: '#666', fontSize: 15 },
});
