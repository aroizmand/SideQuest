import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { UserAvatar } from '@/components/UserAvatar';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useReceivedRatings } from '@/hooks/useReceivedRatings';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

const GENDER_LABELS: Record<string, string> = {
  man: 'Man', woman: 'Woman', non_binary: 'Non-binary', prefer_not_to_say: '—',
};

const TAG_LABELS: Record<string, string> = {
  showed_up: 'Showed up',
  great_energy: 'Great energy',
  felt_safe: 'Felt safe',
  no_show: 'No-show',
};

export default function PublicProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { profile, loading } = usePublicProfile(userId);
  const { ratings, loading: ratingsLoading } = useReceivedRatings(userId);

  return (
    <Screen style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEyebrow}>— ADVENTURER —</Text>
          <Text style={styles.headerTitle}>{profile?.first_name ?? '...'}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primaryDark} />
      ) : !profile ? (
        <View style={styles.loader}>
          <Text style={{ color: Colors.textMuted, fontSize: FontSize.sm }}>Profile not found.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <UserAvatar
              name={profile.first_name}
              photo={profile.photo_url}
              size={96}
              verified={profile.verified_badge}
            />
            <Text style={styles.name}>{profile.first_name}</Text>
            <Text style={styles.meta}>
              {profile.age} · {GENDER_LABELS[profile.gender] ?? profile.gender}
            </Text>
            {profile.bio ? (
              <Text style={styles.bio}>{profile.bio}</Text>
            ) : null}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {profile.rating_avg != null ? profile.rating_avg.toFixed(1) : '—'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile.rating_count}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            {profile.verified_badge && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: Colors.success }]}>✓</Text>
                  <Text style={styles.statLabel}>Verified</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.sinceRow}>
            <Text style={styles.sinceText}>Member since {profile.member_since}</Text>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={sec.row}>
              <View style={sec.bar} />
              <Text style={sec.text}>REVIEWS</Text>
            </View>

            {ratingsLoading ? (
              <ActivityIndicator color={Colors.primaryDark} style={{ marginTop: Spacing.md }} />
            ) : ratings.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No reviews yet.</Text>
              </View>
            ) : (
              <View style={styles.reviewList}>
                {ratings.map((r) => {
                  const date = new Date(r.created_at).toLocaleDateString([], {
                    month: 'short', day: 'numeric', year: 'numeric',
                  });
                  const stars = '★'.repeat(r.score) + '☆'.repeat(5 - r.score);
                  return (
                    <View key={r.rating_id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <UserAvatar name={r.from_first_name} photo={r.from_photo_url} size={36} />
                        <View style={styles.reviewMeta}>
                          <Text style={styles.reviewFrom}>{r.from_first_name}</Text>
                          <Text style={styles.reviewQuest} numberOfLines={1}>{r.quest_title}</Text>
                        </View>
                        <View style={styles.reviewRight}>
                          <Text style={styles.reviewStars}>{stars}</Text>
                          <Text style={styles.reviewDate}>{date}</Text>
                        </View>
                      </View>
                      {r.tags.length > 0 && (
                        <View style={styles.reviewTags}>
                          {r.tags.map((tag) => (
                            <View key={tag} style={styles.reviewTag}>
                              <Text style={styles.reviewTagText}>{TAG_LABELS[tag] ?? tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 4,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.primaryDark,
  },
  backBtn: { width: 36, alignItems: 'flex-start' },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerEyebrow: {
    color: Colors.text, fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 2, opacity: 0.7,
  },
  headerTitle: {
    color: Colors.text, fontSize: FontSize.lg, fontWeight: '900', letterSpacing: 1,
  },

  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  name: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', marginTop: Spacing.xs },
  meta: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  bio: {
    color: Colors.textSecondary, fontSize: FontSize.sm,
    textAlign: 'center', paddingHorizontal: Spacing.xl, lineHeight: 20,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  statDivider: { width: 2, height: 32, backgroundColor: Colors.border },

  sinceRow: { alignItems: 'center', marginTop: Spacing.md },
  sinceText: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '600' },

  scroll: { paddingBottom: Spacing.lg },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg, gap: Spacing.sm },

  reviewList: { gap: Spacing.sm },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reviewMeta: { flex: 1, gap: 2 },
  reviewFrom: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '800' },
  reviewQuest: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '600' },
  reviewRight: { alignItems: 'flex-end', gap: 2 },
  reviewStars: { color: Colors.primaryDark, fontSize: FontSize.sm, letterSpacing: 1 },
  reviewDate: { color: Colors.textMuted, fontSize: 10 },
  reviewTags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  reviewTag: {
    borderTopWidth: 1, borderLeftWidth: 1, borderBottomWidth: 2, borderRightWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs + 2, paddingVertical: 3,
    backgroundColor: Colors.background,
  },
  reviewTagText: { color: Colors.textMuted, fontSize: 10, fontWeight: '700' },

  emptyCard: {
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center', fontWeight: '600' },
});

const sec = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  bar: { width: 4, height: 14, backgroundColor: Colors.primaryDark, borderRadius: 0 },
  text: {
    color: Colors.text, fontSize: FontSize.xs, fontWeight: '900',
    letterSpacing: 2, textTransform: 'uppercase',
  },
});
