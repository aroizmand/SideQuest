import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { UserAvatar } from "@/components/UserAvatar";
import { useQuestChat } from "@/hooks/useQuestChat";
import { Colors, FontSize, Spacing, Radius } from "@/constants/theme";
import type { ChatMessage } from "@/hooks/useQuestChat";

function MessageBubble({
  msg,
  isOwn,
  showSender,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
}) {
  const time = new Date(msg.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isOwn) {
    return (
      <View style={styles.ownRow}>
        <View style={styles.ownBubble}>
          <Text style={styles.ownText}>{msg.body}</Text>
          <Text style={styles.ownTime}>{time}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.otherRow}>
      {showSender ? (
        <UserAvatar name={msg.sender_name} photo={msg.sender_photo} size={32} />
      ) : (
        <View style={{ width: 32 }} />
      )}
      <View style={styles.otherGroup}>
        {showSender && <Text style={styles.senderName}>{msg.sender_name}</Text>}
        <View style={styles.otherBubble}>
          <Text style={styles.otherText}>{msg.body}</Text>
          <Text style={styles.otherTime}>{time}</Text>
        </View>
      </View>
    </View>
  );
}

export default function QuestChatScreen() {
  const router = useRouter();
  const { questId, title } = useLocalSearchParams<{
    questId: string;
    title: string;
  }>();
  const { messages, loading, sending, sendMessage, myUserId } =
    useQuestChat(questId, title);
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  async function handleSend() {
    const text = draft;
    setDraft("");
    await sendMessage(text);
  }

  // Show sender avatar/name only when the previous message was from a different user
  function shouldShowSender(index: number): boolean {
    if (index === 0) return true;
    return messages[index].user_id !== messages[index - 1].user_id;
  }

  return (
    <Screen style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title ?? "Chat"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        {loading ? (
          <ActivityIndicator style={styles.loader} color={Colors.primary} />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.message_id}
            renderItem={({ item, index }) => (
              <MessageBubble
                msg={item}
                isOwn={item.user_id === myUserId}
                showSender={shouldShowSender(index)}
              />
            )}
            contentContainerStyle={styles.list}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatText}>
                  No messages yet — say hello! 👋
                </Text>
              </View>
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!draft.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!draft.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={Colors.text} />
            ) : (
              <Ionicons name="send" size={16} color={Colors.text} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, padding: Spacing.xs },
  headerTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: "700",
    textAlign: "center",
  },

  loader: { flex: 1 },
  list: { padding: Spacing.md, gap: 4, flexGrow: 1 },

  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.xxl,
  },
  emptyChatText: { color: Colors.textMuted, fontSize: FontSize.sm },

  // Own messages — right side, golden yellow
  ownRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: 2,
  },
  ownBubble: {
    backgroundColor: Colors.primaryDark,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: "75%",
    gap: 4,
  },
  ownText: { color: Colors.text, fontSize: FontSize.sm, lineHeight: 20 },
  ownTime: { color: `${Colors.text}60`, fontSize: 10, textAlign: "right" },

  // Others — left side, surface
  otherRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    marginVertical: 2,
  },
  otherGroup: { flex: 1, gap: 2 },
  senderName: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "700",
    marginLeft: 2,
    marginBottom: 2,
  },
  otherBubble: {
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignSelf: "flex-start",
    maxWidth: "80%",
    gap: 4,
  },
  otherText: { color: Colors.text, fontSize: FontSize.sm, lineHeight: 20 },
  otherTime: { color: Colors.textMuted, fontSize: 10 },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.background,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: FontSize.sm,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primaryDark,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
});
