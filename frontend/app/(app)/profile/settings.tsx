import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { useFeedStore } from '@/stores/feedStore';
import { useMyQuestsStore } from '@/stores/myQuestsStore';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={sec.row}>
      <View style={sec.bar} />
      <Text style={sec.text}>{children}</Text>
    </View>
  );
}

type RowProps = {
  label: string;
  sublabel?: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  iconName?: string;
};

function Row({ label, sublabel, onPress, destructive, showChevron, iconName }: RowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
          {label}
        </Text>
        {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      )}
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
  const [phone, setPhone] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setPhone(data.user?.phone ?? null);
    });
  }, []);

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
    <Screen edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEyebrow}>— PREFERENCES —</Text>
          <Text style={styles.headerTitle}>SETTINGS</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Account */}
        <SectionLabel>ACCOUNT</SectionLabel>
        <View style={styles.card}>
          <Row
            label="Edit Profile"
            onPress={() => router.push('/profile/edit-profile')}
            showChevron
          />
          <Separator />
          <Row
            label="Phone Number"
            sublabel={phone ?? '—'}
          />
        </View>

        {/* Support */}
        <SectionLabel>SUPPORT</SectionLabel>
        <View style={styles.card}>
          <Row
            label="Help & FAQ"
            onPress={() => Linking.openURL('mailto:support@sidequest.app?subject=Help')}
            showChevron
          />
          <Separator />
          <Row
            label="Contact Us"
            onPress={() => Linking.openURL('mailto:support@sidequest.app')}
            showChevron
          />
        </View>

        {/* Legal */}
        <SectionLabel>LEGAL</SectionLabel>
        <View style={styles.card}>
          <Row
            label="Terms of Service"
            onPress={() => router.push({ pathname: '/profile/legal', params: { type: 'tos' } })}
            showChevron
          />
          <Separator />
          <Row
            label="Privacy Policy"
            onPress={() => router.push({ pathname: '/profile/legal', params: { type: 'privacy' } })}
            showChevron
          />
        </View>

        {/* Session */}
        <SectionLabel>SESSION</SectionLabel>
        <View style={styles.card}>
          <Row label="Sign Out" onPress={handleSignOut} destructive />
          <Separator />
          <Row
            label={deleting ? 'Deleting…' : 'Delete Account'}
            onPress={deleting ? undefined : handleDeleteAccount}
            destructive
          />
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.7,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '900',
    letterSpacing: 2,
  },

  content: { padding: Spacing.lg, gap: Spacing.sm },

  card: {
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  rowLeft: { flex: 1, gap: 2 },
  rowLabel: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  rowLabelDestructive: { color: Colors.error },
  rowSublabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  separator: { height: 2, backgroundColor: Colors.border },
});

const sec = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  bar: {
    width: 4,
    height: 14,
    backgroundColor: Colors.primaryDark,
    borderRadius: 0,
  },
  text: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
