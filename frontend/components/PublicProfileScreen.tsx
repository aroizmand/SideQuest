import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { UserAvatar } from '@/components/UserAvatar';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

const GENDER_LABELS: Record<string, string> = {
  man: 'Man', woman: 'Woman', non_binary: 'Non-binary', prefer_not_to_say: '—',
};

export default function PublicProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { profile, loading } = usePublicProfile(userId);

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {loading || !profile ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : (
        <>
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
                {profile.rating_avg ? profile.rating_avg.toFixed(1) : '—'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile.rating_count}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  backBtn: { padding: Spacing.xs },
  loader: { flex: 1 },
  hero: {
    alignItems: 'center', paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg, gap: Spacing.sm,
  },
  name: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', marginTop: Spacing.xs },
  meta: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  bio: {
    color: Colors.textSecondary, fontSize: FontSize.sm,
    textAlign: 'center', paddingHorizontal: Spacing.xl, lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800' },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '600' },
  statDivider: { width: 2, height: 32, backgroundColor: Colors.border },
});
