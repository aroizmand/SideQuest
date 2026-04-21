import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedFilters } from '@/hooks/useFeedQuests';

interface Props {
  viewMode: 'list' | 'map';
  onToggleView: () => void;
  filters: FeedFilters;
  onFiltersChange: (f: FeedFilters) => void;
}

export function FeedHeader({ viewMode, onToggleView, filters, onFiltersChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SideQuest</Text>
      <View style={styles.actions}>
        <Pressable style={styles.iconButton} onPress={onToggleView}>
          <Ionicons name={viewMode === 'list' ? 'map-outline' : 'list-outline'} size={22} color="#FFF" />
        </Pressable>
        <Pressable style={styles.iconButton}>
          <Ionicons name="options-outline" size={22} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, backgroundColor: '#0D0D0D' },
  title: { fontSize: 22, fontWeight: '800', color: '#FF5C00' },
  actions: { flexDirection: 'row', gap: 8 },
  iconButton: { padding: 8, backgroundColor: '#1A1A1A', borderRadius: 10 },
});
