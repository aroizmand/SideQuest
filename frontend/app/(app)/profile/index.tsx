import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { UserAvatar } from '@/components/UserAvatar';
import { useOwnProfile } from '@/hooks/useOwnProfile';
import { pickAndUploadAvatar } from '@/lib/uploadAvatar';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, reload } = useOwnProfile();
  const [uploading, setUploading] = useState(false);

  async function handleAvatarPress() {
    if (!profile || uploading) return;
    setUploading(true);
    const url = await pickAndUploadAvatar(profile.user_id);
    setUploading(false);
    if (url) reload();
  }

  return (
    <Screen style={styles.screen}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Me</Text>
        <TouchableOpacity onPress={() => router.push('/profile/settings')} style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar + identity */}
      <View style={styles.heroSection}>
        <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8} style={styles.avatarWrapper}>
          <UserAvatar
            name={profile?.first_name ?? '?'}
            photo={profile?.photo_url ?? null}
            size={96}
            verified={profile?.verified_badge ?? false}
          />
          <View style={styles.editBadge}>
            {uploading
              ? <ActivityIndicator size="small" color={Colors.text} />
              : <Text style={styles.editBadgeText}>✎</Text>
            }
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>{profile?.first_name ?? '—'}</Text>
        {profile?.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : null}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {profile?.rating_avg ? profile.rating_avg.toFixed(1) : '—'}
          </Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{profile?.rating_count ?? 0}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
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

      {/* Edit profile link */}
      <View style={styles.editRow}>
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => router.push('/profile/edit-profile')}
          activeOpacity={0.75}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  screenTitle: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '700' },
  settingsBtn: { padding: Spacing.sm },
  settingsIcon: { fontSize: 22, color: Colors.textSecondary },

  heroSection: {
    alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.lg, gap: Spacing.sm,
  },
  avatarWrapper: { marginBottom: Spacing.xs },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  editBadgeText: { color: Colors.textSecondary, fontSize: 13 },

  name: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '700' },
  bio: {
    color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },

  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  editRow: { paddingHorizontal: Spacing.xl, marginTop: Spacing.md },
  editProfileBtn: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2, alignItems: 'center',
  },
  editProfileText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '500' },
});
