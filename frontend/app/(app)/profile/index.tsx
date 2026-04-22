import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useOwnProfile } from '@/hooks/useOwnProfile';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile } = useOwnProfile();

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <View />
        <TouchableOpacity onPress={() => router.push('/profile/settings')} style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.first_name?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.first_name ?? '—'}</Text>
        {profile?.rating_avg
          ? <Text style={styles.rating}>★ {profile.rating_avg.toFixed(1)} · {profile.rating_count} ratings</Text>
          : <Text style={styles.rating}>No ratings yet</Text>
        }
        {profile?.verified_badge && <Text style={styles.verified}>✓ Verified</Text>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
  },
  settingsBtn: { padding: Spacing.sm },
  settingsIcon: { fontSize: 22, color: Colors.textSecondary },
  content: { flex: 1, alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.sm },
  avatar: {
    width: 80, height: 80, borderRadius: Radius.full,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '700' },
  name: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '700', marginTop: Spacing.sm },
  rating: { color: Colors.textSecondary, fontSize: FontSize.sm },
  verified: { color: Colors.success, fontSize: FontSize.sm, fontWeight: '600' },
});
