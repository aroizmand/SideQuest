import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { UserAvatar } from '@/components/UserAvatar';
import { useQuestDetail } from '@/hooks/useQuestDetail';
import { useQuestMembership } from '@/hooks/useQuestMembership';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import type { Participant } from '@/hooks/useQuestDetail';

const GENDER_LABELS: Record<string, string> = {
  man: 'Man', woman: 'Woman', non_binary: 'Non-binary', prefer_not_to_say: '—',
};

function ParticipantRow({ p, onPress }: { p: Participant; onPress: () => void }) {
  return (
    <View style={styles.participantRow}>
      <UserAvatar name={p.first_name} photo={p.photo_url} size={40} onPress={onPress} />
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{p.first_name}</Text>
        <Text style={styles.participantMeta}>{p.age} · {GENDER_LABELS[p.gender] ?? p.gender}</Text>
      </View>
    </View>
  );
}

export default function QuestDetailScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quest, loading, reload } = useQuestDetail(id);
  const { isMember, isCreator, acting, join, leave } = useQuestMembership(id);

  // Navigate to a user's profile within the current tab's stack
  const handleUserPress = useCallback((userId: string) => {
    const base = pathname.startsWith('/my-quests') ? '/my-quests' : '/feed';
    router.push({ pathname: `${base}/user/[userId]`, params: { userId } } as any);
  }, [pathname]);

  const handleOpenChat = useCallback(() => {
    router.navigate('/messages');
  }, []);

  async function handleJoin() {
    const error = await join();
    if (error) { Alert.alert('Could not join', error.message); return; }
    reload();
  }

  function handleLeave() {
    Alert.alert('Leave quest', 'Are you sure you want to leave this quest?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave', style: 'destructive', onPress: async () => {
          await leave();
          reload();
        }
      },
    ]);
  }

  if (loading || !quest) {
    return (
      <Screen>
        <View style={styles.loadingHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        </View>
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      </Screen>
    );
  }

  const date = new Date(quest.starts_at);
  const dateStr = date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isRestricted = quest.gender_restriction !== 'all';
  const isFull = quest.spots_left <= 0;

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.badges}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{quest.category}</Text>
            </View>
            {isRestricted && (
              <View style={styles.restrictedBadge}>
                <Text style={styles.restrictedText}>👥 My gender</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title + meta */}
        <View style={styles.section}>
          <Text style={styles.title}>{quest.title}</Text>
          <Text style={styles.meta}>📍 {quest.neighborhood}</Text>
          <Text style={styles.meta}>🗓 {dateStr} at {timeStr}</Text>
        </View>

        <View style={styles.divider} />

        {/* Creator */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOSTED BY</Text>
          <View style={styles.creatorRow}>
            <UserAvatar
              name={quest.creator_first_name}
              photo={quest.creator_photo_url}
              size={48}
              verified={quest.creator_verified}
              onPress={() => handleUserPress(quest.creator_id)}
            />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>{quest.creator_first_name}</Text>
              <Text style={styles.creatorMeta}>
                {quest.creator_age} · {GENDER_LABELS[quest.creator_gender] ?? quest.creator_gender}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <Text style={styles.description}>{quest.description}</Text>
        </View>

        <View style={styles.divider} />

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            ADVENTURERS · {quest.current_count}/{quest.max_participants}
          </Text>
          {quest.participants.length === 0 ? (
            <Text style={styles.emptyParticipants}>No one has joined yet. Be the first!</Text>
          ) : (
            quest.participants.map((p) => (
              <ParticipantRow
                key={p.user_id}
                p={p}
                onPress={() => handleUserPress(p.user_id)}
              />
            ))
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Fixed action bar */}
      <View style={styles.actionBar}>
        {isCreator ? (
          <Button label="Open Chat" onPress={handleOpenChat} />
        ) : isMember ? (
          <View style={styles.memberActions}>
            <Button label="Open Chat" onPress={handleOpenChat} />
            <TouchableOpacity onPress={handleLeave} disabled={acting} style={styles.leaveLink}>
              <Text style={styles.leaveLinkText}>{acting ? 'Leaving…' : 'Leave quest'}</Text>
            </TouchableOpacity>
          </View>
        ) : isFull ? (
          <Button label="Quest Full" onPress={() => {}} disabled variant="ghost" />
        ) : (
          <Button
            label={acting ? 'Joining…' : 'Join Quest'}
            onPress={handleJoin}
            disabled={acting}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: Spacing.lg },
  loadingHeader: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  loader: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  backBtn: { padding: Spacing.sm },
  backText: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  badges: { flexDirection: 'row', gap: Spacing.xs },
  categoryBadge: {
    backgroundColor: `${Colors.accent}33`,
    borderRadius: Radius.sm, borderWidth: 2, borderColor: Colors.accent,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  categoryText: { color: Colors.accent, fontSize: FontSize.xs, fontWeight: '800', textTransform: 'uppercase' },
  restrictedBadge: {
    backgroundColor: Colors.surface, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderWidth: 2, borderColor: Colors.border,
  },
  restrictedText: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '700' },

  section: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
  divider: { height: 2, backgroundColor: Colors.border },

  sectionLabel: {
    color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  title: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', lineHeight: 30 },
  meta: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  description: { color: Colors.textSecondary, fontSize: FontSize.md, lineHeight: 24 },

  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  creatorInfo: { gap: 2 },
  creatorName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '800' },
  creatorMeta: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },

  participantRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
  participantInfo: { gap: 2 },
  participantName: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  participantMeta: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600' },
  emptyParticipants: { color: Colors.textMuted, fontSize: FontSize.sm, fontStyle: 'italic' },

  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 2, borderTopColor: Colors.border,
    padding: Spacing.lg,
  },
  memberActions: { gap: Spacing.sm },
  leaveLink: { alignItems: 'center', paddingVertical: Spacing.xs },
  leaveLinkText: { color: Colors.error, fontSize: FontSize.sm, fontWeight: '700' },
});
