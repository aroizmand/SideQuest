import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { UserAvatar } from "@/components/UserAvatar";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { usePastQuests } from "@/hooks/usePastQuests";
import { useReceivedRatings } from "@/hooks/useReceivedRatings";
import { pickAndUploadAvatar } from "@/lib/uploadAvatar";
import { Colors, FontSize, Spacing, Radius } from "@/constants/theme";
import type { PastQuest } from "@/hooks/usePastQuests";
import type { ReceivedRating } from "@/hooks/useReceivedRatings";

const TAG_LABELS: Record<string, string> = {
  showed_up: 'Showed up',
  great_energy: 'Great energy',
  felt_safe: 'Felt safe',
  no_show: 'No-show',
};

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={sec.row}>
      <View style={sec.bar} />
      <Text style={sec.text}>{children}</Text>
    </View>
  );
}

function QuestHistoryRow({ quest, onPress }: { quest: PastQuest; onPress: () => void }) {
  const date = new Date(quest.starts_at).toLocaleDateString([], {
    month: "short", day: "numeric", year: "numeric",
  });
  return (
    <TouchableOpacity style={styles.historyRow} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle} numberOfLines={1}>{quest.title}</Text>
        <Text style={styles.historyMeta}>{quest.category} · {date}</Text>
      </View>
      <View style={styles.rateChip}>
        <Text style={styles.rateChipText}>RATE CREW</Text>
      </View>
    </TouchableOpacity>
  );
}

function ReviewCard({ rating }: { rating: ReceivedRating }) {
  const date = new Date(rating.created_at).toLocaleDateString([], {
    month: "short", day: "numeric", year: "numeric",
  });
  const stars = '★'.repeat(rating.score) + '☆'.repeat(5 - rating.score);
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <UserAvatar name={rating.from_first_name} photo={rating.from_photo_url} size={36} />
        <View style={styles.reviewMeta}>
          <Text style={styles.reviewFrom}>{rating.from_first_name}</Text>
          <Text style={styles.reviewQuest} numberOfLines={1}>{rating.quest_title}</Text>
        </View>
        <View style={styles.reviewRight}>
          <Text style={styles.reviewStars}>{stars}</Text>
          <Text style={styles.reviewDate}>{date}</Text>
        </View>
      </View>
      {rating.tags.length > 0 && (
        <View style={styles.reviewTags}>
          {rating.tags.map((tag) => (
            <View key={tag} style={styles.reviewTag}>
              <Text style={styles.reviewTagText}>{TAG_LABELS[tag] ?? tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, reload } = useOwnProfile();
  const { quests: pastQuests, loading: questsLoading } = usePastQuests();
  const { ratings: receivedRatings, loading: ratingsLoading } = useReceivedRatings(profile?.user_id);
  const [uploading, setUploading] = useState(false);

  async function handleAvatarPress() {
    if (!profile || uploading) return;
    setUploading(true);
    const url = await pickAndUploadAvatar(profile.user_id);
    setUploading(false);
    if (url) reload();
  }

  return (
    <Screen style={styles.screen} edges={["top", "left", "right"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarEyebrow}>— YOUR PROFILE —</Text>
          <Text style={styles.screenTitle}>ME</Text>
        </View>
        <TouchableOpacity
          style={styles.gearBtn}
          onPress={() => router.push("/profile/settings")}
          activeOpacity={0.75}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + identity */}
        <View style={styles.heroSection}>
          <TouchableOpacity
            onPress={handleAvatarPress}
            activeOpacity={0.8}
            style={styles.avatarWrapper}
          >
            <UserAvatar
              name={profile?.first_name ?? "?"}
              photo={profile?.photo_url ?? null}
              size={96}
              verified={profile?.verified_badge ?? false}
            />
            <View style={styles.editBadge}>
              {uploading ? (
                <ActivityIndicator size="small" color={Colors.text} />
              ) : (
                <Text style={styles.editBadgeText}>✎</Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{profile?.first_name ?? "—"}</Text>
          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {profile?.rating_avg ? profile.rating_avg.toFixed(1) : "—"}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile?.rating_count ?? 0}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{pastQuests.length}</Text>
            <Text style={styles.statLabel}>Quests</Text>
          </View>
          {profile?.verified_badge && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: Colors.success }]}>✓</Text>
                <Text style={styles.statLabel}>Verified</Text>
              </View>
            </>
          )}
        </View>

        {/* Edit profile */}
        <View style={styles.editRow}>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => router.push("/profile/edit-profile")}
            activeOpacity={0.75}
          >
            <Text style={styles.editProfileText}>EDIT PROFILE</Text>
          </TouchableOpacity>
        </View>

        {/* Accomplished quests */}
        <View style={styles.section}>
          <SectionLabel>ACCOMPLISHED QUESTS</SectionLabel>

          {questsLoading ? (
            <ActivityIndicator color={Colors.primaryDark} style={{ marginTop: Spacing.md }} />
          ) : pastQuests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No completed quests yet — get out there! 🧭
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {pastQuests.map((q) => (
                <QuestHistoryRow
                  key={q.quest_id}
                  quest={q}
                  onPress={() =>
                    router.push({
                      pathname: "/profile/rate/[questId]",
                      params: { questId: q.quest_id, title: q.title },
                    } as any)
                  }
                />
              ))}
            </View>
          )}
        </View>

        {/* Received reviews */}
        <View style={styles.section}>
          <SectionLabel>REVIEWS RECEIVED</SectionLabel>

          {ratingsLoading ? (
            <ActivityIndicator color={Colors.primaryDark} style={{ marginTop: Spacing.md }} />
          ) : receivedRatings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No reviews yet — complete a quest to get rated!
              </Text>
            </View>
          ) : (
            <View style={styles.reviewList}>
              {receivedRatings.map((r) => (
                <ReviewCard key={r.rating_id} rating={r} />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: Spacing.lg },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 4,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.primaryDark,
  },
  topBarSpacer: { width: 36 },
  topBarCenter: { flex: 1, alignItems: "center", gap: 2 },
  topBarEyebrow: {
    color: Colors.text, fontSize: FontSize.xs, fontWeight: "800", letterSpacing: 2, opacity: 0.7,
  },
  screenTitle: {
    color: Colors.text, fontSize: FontSize.xxl, fontWeight: "900", letterSpacing: 2,
  },
  gearBtn: { width: 36, alignItems: "flex-end" },

  heroSection: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  avatarWrapper: { marginBottom: Spacing.xs },
  editBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 2, borderColor: Colors.background,
    alignItems: "center", justifyContent: "center",
  },
  editBadgeText: { color: Colors.textSecondary, fontSize: 13 },
  name: { color: Colors.text, fontSize: FontSize.xl, fontWeight: "700" },
  bio: {
    color: Colors.textSecondary, fontSize: FontSize.sm,
    textAlign: "center", paddingHorizontal: Spacing.xl,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { color: Colors.text, fontSize: FontSize.lg, fontWeight: "700" },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  statDivider: { width: 2, height: 32, backgroundColor: Colors.border },

  editRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
  },
  editProfileBtn: {
    flex: 1,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border, borderRadius: Radius.sm,
    paddingVertical: Spacing.sm + 2,
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  editProfileText: {
    color: Colors.text, fontSize: FontSize.xs, fontWeight: "800", letterSpacing: 1,
  },

  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },

  // Accomplished quests
  historyList: {
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    overflow: "hidden",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  historyInfo: { flex: 1, gap: 2, marginRight: Spacing.sm },
  historyTitle: { color: Colors.text, fontSize: FontSize.sm, fontWeight: "700" },
  historyMeta: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: "600" },
  rateChip: {
    backgroundColor: `${Colors.primaryDark}33`,
    borderTopWidth: 1, borderLeftWidth: 1, borderBottomWidth: 2, borderRightWidth: 2,
    borderColor: Colors.primaryDark,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 3,
  },
  rateChipText: { color: Colors.text, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  // Reviews
  reviewList: { gap: Spacing.sm },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  reviewMeta: { flex: 1, gap: 2 },
  reviewFrom: { color: Colors.text, fontSize: FontSize.sm, fontWeight: "800" },
  reviewQuest: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: "600" },
  reviewRight: { alignItems: "flex-end", gap: 2 },
  reviewStars: { color: Colors.primaryDark, fontSize: FontSize.sm, letterSpacing: 1 },
  reviewDate: { color: Colors.textMuted, fontSize: 10 },
  reviewTags: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  reviewTag: {
    borderTopWidth: 1, borderLeftWidth: 1, borderBottomWidth: 2, borderRightWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs + 2, paddingVertical: 3,
    backgroundColor: Colors.background,
  },
  reviewTagText: { color: Colors.textMuted, fontSize: 10, fontWeight: "700" },

  // Shared empty state
  emptyCard: {
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.textMuted, fontSize: FontSize.sm, textAlign: "center", fontWeight: "600",
  },
});

const sec = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: 2 },
  bar: { width: 4, height: 14, backgroundColor: Colors.primaryDark, borderRadius: 0 },
  text: {
    color: Colors.text, fontSize: FontSize.xs, fontWeight: "900",
    letterSpacing: 2, textTransform: "uppercase",
  },
});
