import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { QuestCard } from './QuestCard';

interface Props {
  quests: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function QuestFeedList({ quests, loading, onRefresh }: Props) {
  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#FF5C00" size="large" /></View>;
  }

  return (
    <FlatList
      data={quests}
      keyExtractor={q => q.quest_id}
      renderItem={({ item }) => <QuestCard quest={item} />}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#FF5C00" />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No quests nearby right now.</Text>
          <Text style={styles.emptySubtext}>Be the first to create one!</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingTop: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: '#AAA', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { color: '#555', fontSize: 14 },
});
