import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useQuestChats } from '@/hooks/useQuestChats';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import type { QuestChatPreview } from '@/hooks/useQuestChats';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

type CategoryStyle = { icon: string; bg: string };

const CATEGORY_MAP: Record<string, CategoryStyle> = {
  outdoors:   { icon: 'leaf',           bg: '#3A8C1C' },
  hiking:     { icon: 'trail-sign',     bg: '#3A8C1C' },
  nature:     { icon: 'leaf',           bg: '#3A8C1C' },
  sports:     { icon: 'football',       bg: '#C03030' },
  fitness:    { icon: 'barbell',        bg: '#C03030' },
  running:    { icon: 'footsteps',      bg: '#C03030' },
  food:       { icon: 'restaurant',     bg: '#B86000' },
  dining:     { icon: 'restaurant',     bg: '#B86000' },
  drinks:     { icon: 'beer',           bg: '#B86000' },
  art:        { icon: 'color-palette',  bg: '#7A3FAF' },
  music:      { icon: 'musical-notes',  bg: '#7A3FAF' },
  gaming:     { icon: 'game-controller',bg: '#1A5FA0' },
  social:     { icon: 'people',         bg: '#1A7A8A' },
  travel:     { icon: 'airplane',       bg: '#1A7A8A' },
  photography:{ icon: 'camera',         bg: '#7A3FAF' },
  reading:    { icon: 'book',           bg: '#B86000' },
  movies:     { icon: 'film',           bg: '#1A5FA0' },
};

function getCategoryStyle(category: string | null): CategoryStyle {
  if (!category) return { icon: 'flag', bg: Colors.primaryDark };
  const key = category.toLowerCase();
  return CATEGORY_MAP[key] ?? { icon: 'flag', bg: Colors.primaryDark };
}

function ChatRow({ chat, onPress }: { chat: QuestChatPreview; onPress: () => void }) {
  const preview = chat.last_message
    ? `${chat.last_sender}: ${chat.last_message}`
    : 'No messages yet — say hello!';
  const catStyle = getCategoryStyle(chat.category);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.rowIcon, { backgroundColor: catStyle.bg }]}>
        <Ionicons name={catStyle.icon as any} size={20} color={Colors.cream} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.rowTitle} numberOfLines={1}>{chat.title}</Text>
          {chat.last_message_at && (
            <Text style={styles.rowTime}>{timeAgo(chat.last_message_at)}</Text>
          )}
        </View>
        <Text style={styles.rowPreview} numberOfLines={1}>{preview}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const router = useRouter();
  const { chats, loading } = useQuestChats();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>— GROUP CHATS —</Text>
        <Text style={styles.heading}>MESSAGES</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primaryDark} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={c => c.quest_id}
          renderItem={({ item }) => (
            <ChatRow
              chat={item}
              onPress={() => router.push({
                pathname: '/messages/[questId]',
                params: { questId: item.quest_id, title: item.title },
              })}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubble" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                Join or create a quest to start chatting with the group.
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
    borderBottomWidth: 4, borderBottomColor: Colors.border,
    backgroundColor: Colors.primaryDark, alignItems: 'center', gap: 2,
  },
  headerEyebrow: { color: Colors.text, fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 2, opacity: 0.7 },
  heading: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '900', letterSpacing: 2 },
  loader: { flex: 1 },
  list: { flexGrow: 1 },
  separator: { height: 2, backgroundColor: Colors.border, marginLeft: 72 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  rowIcon: {
    width: 44, height: 44,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 3, borderRightWidth: 3,
    borderColor: Colors.border, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 2 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700', flex: 1, marginRight: Spacing.sm },
  rowTime: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '600' },
  rowPreview: { color: Colors.textSecondary, fontSize: FontSize.sm },

  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl,
  },
  emptyTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  emptySubtitle: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});
