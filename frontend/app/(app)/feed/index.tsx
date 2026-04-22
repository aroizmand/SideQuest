import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFeedQuests } from '@/hooks/useFeedQuests';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import type { FeedQuest } from '@/types/quest';

function QuestCard({ quest }: { quest: FeedQuest }) {
  const time = new Date(quest.starts_at).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardCategory}>{quest.category}</Text>
        <Text style={styles.cardSpots}>{quest.spots_left} spots left</Text>
      </View>
      <Text style={styles.cardTitle}>{quest.title}</Text>
      <Text style={styles.cardMeta}>{quest.neighborhood} · {time}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>{quest.description}</Text>
    </View>
  );
}

export default function FeedScreen() {
  const { quests, loading, refreshing, refresh } = useFeedQuests();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.heading}>Discover</Text>
      </View>
      {loading
        ? <ActivityIndicator style={styles.loader} color={Colors.primary} />
        : (
          <FlatList
            data={quests}
            keyExtractor={(q) => q.quest_id}
            renderItem={({ item }) => <QuestCard quest={item} />}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>No active quests nearby.</Text>}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />}
          />
        )
      }
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  heading: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '700' },
  loader: { flex: 1 },
  list: { padding: Spacing.lg, gap: Spacing.md },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xxl },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, gap: Spacing.xs, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardCategory: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
  cardSpots: { color: Colors.textMuted, fontSize: FontSize.xs },
  cardTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '600' },
  cardMeta: { color: Colors.textSecondary, fontSize: FontSize.sm },
  cardDesc: { color: Colors.textMuted, fontSize: FontSize.sm },
});
