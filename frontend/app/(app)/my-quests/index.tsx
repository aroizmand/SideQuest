import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMyQuests } from '@/hooks/useMyQuests';
import { QuestCard } from '@/components/feed/QuestCard';

export default function MyQuestsScreen() {
  const { created, joined, loading } = useMyQuests();
  const router = useRouter();

  if (loading) return <View style={styles.center}><ActivityIndicator color="#FF5C00" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>My Quests</Text>

      <Text style={styles.sectionTitle}>Quests I'm joining</Text>
      {joined.length === 0
        ? <Text style={styles.empty}>No upcoming quests. Go explore!</Text>
        : joined.map(q => (
            <Pressable key={q.quest_id} onPress={() => router.push(`/(app)/my-quests/quest/${q.quest_id}/chat`)}>
              <QuestCard quest={q} showChatBadge />
            </Pressable>
          ))
      }

      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Quests I've created</Text>
      {created.length === 0
        ? <Text style={styles.empty}>You haven't created any quests yet.</Text>
        : created.map(q => (
            <Pressable key={q.quest_id} onPress={() => router.push(`/(app)/my-quests/quest/${q.quest_id}/manage`)}>
              <QuestCard quest={q} showManageBadge />
            </Pressable>
          ))
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 24, paddingTop: 60 },
  center: { flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#AAA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { color: '#555', fontSize: 14, marginBottom: 8 },
});
