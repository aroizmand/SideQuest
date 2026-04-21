import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { QuestFeedList } from '@/components/feed/QuestFeedList';
import { QuestFeedMap } from '@/components/feed/QuestFeedMap';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { useFeedQuests } from '@/hooks/useFeedQuests';

export default function FeedScreen() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { quests, loading, refetch, filters, setFilters } = useFeedQuests();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <FeedHeader
        viewMode={viewMode}
        onToggleView={() => setViewMode(v => v === 'list' ? 'map' : 'list')}
        filters={filters}
        onFiltersChange={setFilters}
      />
      {viewMode === 'list' ? (
        <QuestFeedList quests={quests} loading={loading} onRefresh={refetch} />
      ) : (
        <QuestFeedMap quests={quests} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
});
