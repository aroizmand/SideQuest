import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { useMyQuests } from "@/hooks/useMyQuests";
import { Colors, FontSize, Spacing, Radius } from "@/constants/theme";
import type { Quest } from "@/types/quest";

function QuestRow({ quest, onPress }: { quest: Quest; onPress: () => void }) {
  const time = new Date(quest.starts_at).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const isActive = quest.status === "active";
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{quest.title}</Text>
        <Text style={styles.rowMeta}>{time}</Text>
      </View>
      <View
        style={[
          styles.badge,
          isActive ? styles.badgeActive : styles.badgePending,
        ]}
      >
        <Text style={styles.badgeText}>{quest.status.replace("_", " ")}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MyQuestsScreen() {
  const router = useRouter();
  const { quests, loading, refreshing, refresh } = useMyQuests();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>— YOUR ADVENTURES —</Text>
        <Text style={styles.heading}>UPCOMING QUESTS</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : (
        <FlatList
          data={quests}
          keyExtractor={(q) => q.quest_id}
          renderItem={({ item }) => (
            <QuestRow
              quest={item}
              onPress={() => router.push(`/my-quests/quest/${item.quest_id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Nothing here yet. Go explore and join a quest! 🧭
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 4,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.primaryDark,
    alignItems: "center",
    gap: 2,
  },
  headerEyebrow: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 2,
    opacity: 0.7,
  },
  heading: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: "900",
    letterSpacing: 2,
  },
  loader: { flex: 1 },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  empty: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xxl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
  },
  rowInfo: { flex: 1, gap: 2 },
  rowTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: "600" },
  rowMeta: { color: Colors.textSecondary, fontSize: FontSize.sm },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeActive: { backgroundColor: `${Colors.success}33` },
  badgePending: { backgroundColor: `${Colors.primary}33` },
  badgeText: { color: Colors.text, fontSize: FontSize.xs, fontWeight: "600" },
});
