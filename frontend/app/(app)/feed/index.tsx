import { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { UserAvatar } from "@/components/UserAvatar";
import { RadiusSlider } from "@/components/RadiusSlider";
import { RetroTitle } from "@/components/RetroTitle";
import { useFeedQuests } from "@/hooks/useFeedQuests";
import { useFeedStore } from "@/stores/feedStore";
import { Colors, FontSize, Spacing, Radius } from "@/constants/theme";
import type { FeedQuest } from "@/types/quest";

const GENDER_LABELS: Record<string, string> = {
  man: "Man",
  woman: "Woman",
  non_binary: "Non-binary",
  prefer_not_to_say: "—",
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function QuestCard({
  quest,
  onPress,
  onUserPress,
}: {
  quest: FeedQuest;
  onPress: () => void;
  onUserPress: (userId: string) => void;
}) {
  const time = new Date(quest.starts_at).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const genderLabel =
    GENDER_LABELS[quest.creator_gender] ?? quest.creator_gender;
  const isRestricted = quest.gender_restriction !== "all";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardCategory}>{quest.category}</Text>
          {isRestricted && (
            <View style={styles.restrictedBadge}>
              <Text style={styles.restrictedText}>👥 My gender</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardSpots}>
          {quest.spots_left} spot{quest.spots_left !== 1 ? "s" : ""} left
        </Text>
      </View>

      <Text style={styles.cardTitle}>{quest.title}</Text>
      <Text style={styles.cardMeta}>
        {quest.neighborhood} · {time}
      </Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {quest.description}
      </Text>

      <View>
        <Text style={styles.participantsLabel}>
          {quest.participants.length} joined
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.creatorRow}>
        <UserAvatar
          name={quest.creator_first_name}
          photo={quest.creator_photo_url}
          size={36}
          verified={quest.creator_verified}
          onPress={() => onUserPress(quest.creator_id)}
        />
        <View style={styles.creatorInfo}>
          <Text style={styles.creatorName}>{quest.creator_first_name}</Text>
          <Text style={styles.creatorMeta}>
            {quest.creator_age} · {genderLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const { quests, loading, refreshing, refresh, coords, locationDenied } = useFeedQuests();
  const { radius, setRadius, userCity, setUserCity } = useFeedStore();
  const [search, setSearch] = useState("");

  function handleUserPress(userId: string) {
    router.push({ pathname: "/feed/user/[userId]", params: { userId } } as any);
  }

  const locationFiltered = useMemo(() => {
    if (coords && radius < 100) {
      return quests.filter(
        (q) => haversineKm(coords.lat, coords.lng, q.lat_area, q.lng_area) <= radius
      );
    }
    if (locationDenied && userCity.trim()) {
      return quests.filter((q) =>
        q.city.toLowerCase().includes(userCity.trim().toLowerCase())
      );
    }
    return quests;
  }, [quests, coords, radius, locationDenied, userCity]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locationFiltered;
    return locationFiltered.filter(
      (quest) =>
        quest.title.toLowerCase().includes(q) ||
        quest.description.toLowerCase().includes(q)
    );
  }, [locationFiltered, search]);

  return (
    <Screen edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <RetroTitle>EXPLORE</RetroTitle>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search quests…"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {coords && (
        <View style={styles.radiusRow}>
          <View style={styles.radiusLabelRow}>
            <Text style={styles.radiusLabel}>RADIUS</Text>
            <Text style={styles.radiusValue}>
              {radius >= 100 ? "ANY" : `${radius} KM`}
            </Text>
          </View>
          <RadiusSlider value={radius} onChange={setRadius} />
        </View>
      )}

      {locationDenied && (
        <View style={styles.cityWrap}>
          <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.cityInput}
            value={userCity}
            onChangeText={setUserCity}
            placeholder="Filter by city…"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="done"
            autoCorrect={false}
          />
          {userCity.length > 0 && (
            <TouchableOpacity onPress={() => setUserCity("")} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : (
        <FlatList
          style={styles.listContainer}
          data={filtered}
          keyExtractor={(q) => q.quest_id}
          renderItem={({ item }) => (
            <QuestCard
              quest={item}
              onPress={() => router.push(`/feed/quest/${item.quest_id}`)}
              onUserPress={handleUserPress}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {search.trim().length > 0
                ? "No quests match your search."
                : coords && radius < 100
                ? `No quests within ${radius} km of you.`
                : locationDenied && userCity.trim()
                ? `No quests found in "${userCity}".`
                : "No quests out there yet — be the first to post one! 🏕"}
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
  listContainer: { flex: 1 },
  loader: { flex: 1 },
  list: { padding: Spacing.lg, gap: Spacing.md },

  searchWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.sm,
    padding: 0,
  },

  radiusRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  radiusLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  radiusLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1,
  },
  radiusValue: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: "800",
  },
  cityWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  cityInput: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.sm,
    padding: 0,
  },

  empty: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xxl,
    fontWeight: "600",
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  cardCategory: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  restrictedBadge: {
    backgroundColor: `${Colors.primary}33`,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  restrictedText: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  cardSpots: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  cardTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: "800" },
  cardMeta: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  cardDesc: { color: Colors.textSecondary, fontSize: FontSize.sm },

  participantsLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },

  divider: { height: 2, backgroundColor: Colors.border },

  creatorRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  creatorInfo: { flex: 1 },
  creatorName: { color: Colors.text, fontSize: FontSize.sm, fontWeight: "700" },
  creatorMeta: { color: Colors.textSecondary, fontSize: FontSize.xs },
});
