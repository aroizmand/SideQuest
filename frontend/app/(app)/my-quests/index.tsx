import { useMemo, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { RetroTitle } from "@/components/RetroTitle";
import { useMyQuests } from "@/hooks/useMyQuests";
import { Colors, FontSize, Spacing, Radius } from "@/constants/theme";
import type { MyQuest } from "@/hooks/useMyQuests";

type Tab = "hosting" | "joined" | "past";

function QuestRow({ quest, onPress }: { quest: MyQuest; onPress: () => void }) {
  const date = new Date(quest.starts_at);
  const dateStr = date.toLocaleDateString([], {
    weekday: "short", month: "short", day: "numeric",
  });
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.rowInfo}>
        <View style={styles.rowTopLine}>
          <Text style={styles.rowTitle} numberOfLines={1}>{quest.title}</Text>
          {quest.is_creator && (
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>HOST</Text>
            </View>
          )}
        </View>
        <Text style={styles.rowMeta}>
          {dateStr} · {timeStr}
        </Text>
        <Text style={styles.rowSubMeta}>
          {quest.current_count}/{quest.max_participants} adventurers
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

function TabBar({ tab, onChange, counts }: {
  tab: Tab;
  onChange: (t: Tab) => void;
  counts: Record<Tab, number>;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "hosting", label: "HOSTING" },
    { id: "joined",  label: "JOINED"  },
    { id: "past",    label: "PAST"    },
  ];
  return (
    <View style={styles.tabBar}>
      {tabs.map((t) => {
        const active = tab === t.id;
        return (
          <TouchableOpacity
            key={t.id}
            style={[styles.tabBtn, active && styles.tabBtnActive]}
            onPress={() => onChange(t.id)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>
              {t.label} {counts[t.id] > 0 ? `· ${counts[t.id]}` : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MyQuestsScreen() {
  const router = useRouter();
  const { quests, loading, refreshing, refresh } = useMyQuests();
  const [tab, setTab] = useState<Tab>("hosting");

  const { hosting, joined, past, counts } = useMemo(() => {
    const hosting: MyQuest[] = [];
    const joined:  MyQuest[] = [];
    const past:    MyQuest[] = [];
    for (const q of quests) {
      if (q.is_past) past.push(q);
      else if (q.is_creator) hosting.push(q);
      else joined.push(q);
    }
    return {
      hosting, joined, past,
      counts: { hosting: hosting.length, joined: joined.length, past: past.length },
    };
  }, [quests]);

  const visible = tab === "hosting" ? hosting : tab === "joined" ? joined : past;

  const emptyText =
    tab === "hosting" ? "You haven't created any quests yet." :
    tab === "joined"  ? "You haven't joined any quests yet. Go explore!" :
                        "No past quests yet.";

  return (
    <Screen edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <RetroTitle>MY QUESTS</RetroTitle>
      </View>

      <TabBar tab={tab} onChange={setTab} counts={counts} />

      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(q) => q.quest_id}
          renderItem={({ item }) => (
            <QuestRow
              quest={item}
              onPress={() => router.push(`/my-quests/quest/${item.quest_id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
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
  tabBar: {
    flexDirection: "row",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: Colors.primaryDark },
  tabText: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: "800", letterSpacing: 0.5 },
  tabTextActive: { color: Colors.text },

  loader: { flex: 1 },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  empty: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xxl,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
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
  rowTopLine: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  rowTitle: { flex: 1, color: Colors.text, fontSize: FontSize.md, fontWeight: "800" },
  rowMeta: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: "600" },
  rowSubMeta: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: "600" },

  hostBadge: {
    backgroundColor: `${Colors.primaryDark}33`,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.primaryDark,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
  },
  hostBadgeText: {
    color: Colors.text,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
