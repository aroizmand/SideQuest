import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { useFeedStore } from '@/stores/feedStore';
import { useMyQuestsStore } from '@/stores/myQuestsStore';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

type RowProps = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  hideChevron?: boolean;
};

function Row({ label, onPress, destructive, hideChevron }: RowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
      {!hideChevron && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { setSession, setHasProfile } = useAuthStore();
  const clearProfile = useProfileStore(s => s.setProfile);
  const clearFeed = useFeedStore(s => s.setQuests);
  const clearMyQuests = useMyQuestsStore(s => s.setQuests);
  const [deleting, setDeleting] = useState(false);

  function clearCaches() {
    clearProfile(null);
    clearFeed([]);
    clearMyQuests([]);
  }

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive', onPress: () => {
          clearCaches();
          supabase.auth.signOut();
        }
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete account',
      'This permanently removes your profile, quests, and all data. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Are you absolutely sure?',
              'Your account will be gone forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes, delete it', style: 'destructive', onPress: confirmDelete },
              ]
            ),
        },
      ]
    );
  }

  async function confirmDelete() {
    setDeleting(true);
    const { error } = await supabase.rpc('delete_my_account');
    setDeleting(false);
    if (error) { Alert.alert('Error', error.message); return; }
    clearCaches();
    setSession(null);
    setHasProfile(false);
    await supabase.auth.signOut().catch(() => {});
  }

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>LEGAL</Text>
        <View style={styles.card}>
          <Row label="Terms of Service" onPress={() => router.push({ pathname: '/profile/legal', params: { type: 'tos' } })} />
          <Separator />
          <Row label="Privacy Policy" onPress={() => router.push({ pathname: '/profile/legal', params: { type: 'privacy' } })} />
        </View>

        <View style={styles.card}>
          <Row label="Sign Out" onPress={handleSignOut} hideChevron />
        </View>

        <View style={styles.card}>
          <Row
            label={deleting ? 'Deleting…' : 'Delete Account'}
            onPress={deleting ? () => {} : handleDeleteAccount}
            destructive
            hideChevron
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  backBtn: { width: 36, padding: Spacing.xs },
  backText: { color: Colors.text, fontSize: FontSize.xl },
  title: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  content: { padding: Spacing.lg, gap: Spacing.sm },
  sectionTitle: {
    color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: Spacing.md, marginBottom: Spacing.xs, paddingHorizontal: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 16,
  },
  rowLabel: { color: Colors.text, fontSize: FontSize.md },
  rowLabelDestructive: { color: Colors.error },
  chevron: { color: Colors.textMuted, fontSize: 20 },
  separator: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
});
