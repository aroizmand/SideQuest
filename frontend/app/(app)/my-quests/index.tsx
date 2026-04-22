import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { useMyQuests } from '@/hooks/useMyQuests';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import type { Quest } from '@/types/quest';

function QuestRow({ quest }: { quest: Quest }) {
  const time = new Date(quest.starts_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const isActive = quest.status === 'active';
  return (
    <View style={styles.row}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{quest.title}</Text>
        <Text style={styles.rowMeta}>{time}</Text>
      </View>
      <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgePending]}>
        <Text style={styles.badgeText}>{quest.status.replace('_', ' ')}</Text>
      </View>
    </View>
  );
}

export default function MyQuestsScreen() {
  const { quests, loading, refreshing, refresh } = useMyQuests();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.heading}>My Quests</Text>
      </View>
      {loading
        ? <ActivityIndicator style={styles.loader} color={Colors.primary} />
        : (
          <FlatList
            data={quests}
            keyExtractor={(q) => q.quest_id}
            renderItem={({ item }) => <QuestRow quest={item} />}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>You haven't joined any quests yet.</Text>}
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
  list: { padding: Spacing.lg, gap: Spacing.sm },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xxl },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  rowInfo: { flex: 1, gap: 2 },
  rowTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  rowMeta: { color: Colors.textSecondary, fontSize: FontSize.sm },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  badgeActive: { backgroundColor: '#00C85322' },
  badgePending: { backgroundColor: '#FF5C0022' },
  badgeText: { color: Colors.text, fontSize: FontSize.xs, fontWeight: '600' },
});
