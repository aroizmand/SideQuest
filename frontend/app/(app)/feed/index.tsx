import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { UserAvatar } from '@/components/UserAvatar';
import { useFeedQuests } from '@/hooks/useFeedQuests';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import type { FeedQuest, ParticipantPreview } from '@/types/quest';

const GENDER_LABELS: Record<string, string> = {
  man: 'Man', woman: 'Woman', non_binary: 'Non-binary', prefer_not_to_say: '—',
};

function ParticipantChip({ p, onPress }: { p: ParticipantPreview; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.participantChip} onPress={onPress} activeOpacity={0.75}>
      <UserAvatar name={p.first_name} photo={p.photo_url} size={36} />
      <Text style={styles.participantName}>{p.first_name}</Text>
      <Text style={styles.participantAge}>{p.age}</Text>
    </TouchableOpacity>
  );
}

function QuestCard({ quest, onPress, onUserPress }: {
  quest: FeedQuest;
  onPress: () => void;
  onUserPress: (userId: string) => void;
}) {
  const time = new Date(quest.starts_at).toLocaleString([], {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const genderLabel = GENDER_LABELS[quest.creator_gender] ?? quest.creator_gender;
  const isRestricted = quest.gender_restriction !== 'all';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Category + spots */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardCategory}>{quest.category}</Text>
          {isRestricted && (
            <View style={styles.restrictedBadge}>
              <Text style={styles.restrictedText}>👥 My gender</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardSpots}>{quest.spots_left} spot{quest.spots_left !== 1 ? 's' : ''} left</Text>
      </View>

      <Text style={styles.cardTitle}>{quest.title}</Text>
      <Text style={styles.cardMeta}>{quest.neighborhood} · {time}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>{quest.description}</Text>

      {/* Participants horizontal scroll */}
      {quest.participants.length > 0 && (
        <View>
          <Text style={styles.participantsLabel}>
            {quest.participants.length} joined
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.participantsScroll}>
            {quest.participants.map(p => (
              <ParticipantChip
                key={p.user_id}
                p={p}
                onPress={() => onUserPress(p.user_id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.divider} />

      {/* Creator */}
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
          <Text style={styles.creatorMeta}>{quest.creator_age} · {genderLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const { quests, loading, refreshing, refresh } = useFeedQuests();

  function handleUserPress(userId: string) {
    router.push({ pathname: '/feed/user/[userId]', params: { userId } } as any);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.heading}>Explore</Text>
      </View>
      {loading
        ? <ActivityIndicator style={styles.loader} color={Colors.primary} />
        : (
          <FlatList
            data={quests}
            keyExtractor={(q) => q.quest_id}
            renderItem={({ item }) => (
              <QuestCard
                quest={item}
                onPress={() => router.push(`/feed/quest/${item.quest_id}`)}
                onUserPress={handleUserPress}
              />
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>No quests out there yet — be the first to post one! 🏕</Text>}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />}
          />
        )
      }
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  heading: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800' },
  loader: { flex: 1 },
  list: { padding: Spacing.lg, gap: Spacing.md },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xxl, fontWeight: '600' },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md, gap: Spacing.sm,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  cardCategory: { color: Colors.accent, fontSize: FontSize.sm, fontWeight: '800', textTransform: 'uppercase' },
  restrictedBadge: {
    backgroundColor: `${Colors.primary}33`,
    borderRadius: Radius.sm,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.primary,
  },
  restrictedText: { color: Colors.text, fontSize: FontSize.xs, fontWeight: '700' },
  cardSpots: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '600' },
  cardTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800' },
  cardMeta: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  cardDesc: { color: Colors.textSecondary, fontSize: FontSize.sm },

  participantsLabel: {
    color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.xs,
  },
  participantsScroll: { marginHorizontal: -Spacing.xs },
  participantChip: {
    alignItems: 'center', gap: 4,
    marginHorizontal: Spacing.xs, paddingVertical: 2,
  },
  participantName: { color: Colors.text, fontSize: FontSize.xs, fontWeight: '700' },
  participantAge: { color: Colors.textMuted, fontSize: 10, fontWeight: '600' },

  divider: { height: 2, backgroundColor: Colors.border },

  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  creatorInfo: { flex: 1 },
  creatorName: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  creatorMeta: { color: Colors.textSecondary, fontSize: FontSize.xs },
});
