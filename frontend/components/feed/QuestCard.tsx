import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

interface QuestCardProps {
  quest: {
    quest_id: string;
    title: string;
    category: string;
    starts_at: string;
    neighborhood: string;
    spots_left: number;
    max_participants: number;
    creator_first_name: string;
    creator_photo_url: string;
    creator_rating: number | null;
    creator_verified: boolean;
  };
  showChatBadge?: boolean;
  showManageBadge?: boolean;
}

export function QuestCard({ quest, showChatBadge, showManageBadge }: QuestCardProps) {
  const router = useRouter();
  const date = new Date(quest.starts_at);
  const dateStr = date.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/(app)/feed/quest/${quest.quest_id}`)}>
      <View style={styles.header}>
        <Text style={styles.category}>{quest.category}</Text>
        <Text style={styles.spots}>{quest.spots_left} left</Text>
      </View>
      <Text style={styles.title}>{quest.title}</Text>
      <Text style={styles.meta}>{quest.neighborhood} · {dateStr} at {timeStr}</Text>
      <View style={styles.footer}>
        <Image source={{ uri: quest.creator_photo_url }} style={styles.avatar} />
        <Text style={styles.creatorName}>{quest.creator_first_name}</Text>
        {quest.creator_verified && <Text style={styles.verified}>✓</Text>}
        {quest.creator_rating && <Text style={styles.rating}>★ {quest.creator_rating.toFixed(1)}</Text>}
        {showChatBadge && <View style={styles.badge}><Text style={styles.badgeText}>Chat</Text></View>}
        {showManageBadge && <View style={[styles.badge, styles.manageBadge]}><Text style={styles.badgeText}>Manage</Text></View>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  category: { color: '#FF5C00', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  spots: { color: '#888', fontSize: 12 },
  title: { fontSize: 17, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  meta: { color: '#666', fontSize: 13, marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar: { width: 24, height: 24, borderRadius: 12 },
  creatorName: { color: '#AAA', fontSize: 13 },
  verified: { color: '#FF5C00', fontSize: 12 },
  rating: { color: '#FFB800', fontSize: 13, marginLeft: 4 },
  badge: { marginLeft: 'auto', backgroundColor: '#FF5C00', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  manageBadge: { backgroundColor: '#333' },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
});
