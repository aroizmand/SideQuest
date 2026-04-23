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

function ChatRow({ chat, onPress }: { chat: QuestChatPreview; onPress: () => void }) {
  const preview = chat.last_message
    ? `${chat.last_sender}: ${chat.last_message}`
    : 'No messages yet — say hello!';

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.rowIcon}>
        <Ionicons name="flag" size={18} color={Colors.primary} />
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
        <Text style={styles.heading}>Messages</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
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
              <Ionicons name="chatbubble-outline" size={48} color={Colors.textMuted} />
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
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  heading: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '700' },
  loader: { flex: 1 },
  list: { flexGrow: 1 },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 72 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  rowIcon: {
    width: 44, height: 44, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 2 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600', flex: 1, marginRight: Spacing.sm },
  rowTime: { color: Colors.textMuted, fontSize: FontSize.xs },
  rowPreview: { color: Colors.textSecondary, fontSize: FontSize.sm },

  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl,
  },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
  emptySubtitle: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});
