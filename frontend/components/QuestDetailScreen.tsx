import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { UserAvatar } from '@/components/UserAvatar';
import { useQuestDetail } from '@/hooks/useQuestDetail';
import { useQuestMembership } from '@/hooks/useQuestMembership';
import { RetroTitle } from '@/components/RetroTitle';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import type { Participant } from '@/hooks/useQuestDetail';


function SectionLabel({ children }: { children: string }) {
  return (
    <View style={sec.row}>
      <View style={sec.bar} />
      <Text style={sec.text}>{children}</Text>
    </View>
  );
}
const GENDER_LABELS: Record<string, string> = {
  man: 'Man', woman: 'Woman', non_binary: 'Non-binary', prefer_not_to_say: '—',
};

function ParticipantRow({ p, onPress }: { p: Participant; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.participantRow} onPress={onPress} activeOpacity={0.75}>
      <UserAvatar name={p.first_name} photo={p.photo_url} size={40} />
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{p.first_name}</Text>
        <Text style={styles.participantMeta}>{p.age} · {GENDER_LABELS[p.gender] ?? p.gender}</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function QuestDetailScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quest, loading, reload } = useQuestDetail(id);
  const { isMember, isCreator, acting, join, leave, deleteQuest } = useQuestMembership(id);

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
      { text: 'Leave', style: 'destructive', onPress: async () => { await leave(); router.back(); } },
    ]);
  }

  function handleDelete() {
    Alert.alert('Delete quest', 'This will permanently delete the quest and remove all participants. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const error = await deleteQuest();
          if (error) { Alert.alert('Error', error.message); return; }
          router.back();
        }
      },
    ]);
  }

  if (loading || !quest) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <View style={styles.loadingHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <ActivityIndicator style={styles.loader} color={Colors.primaryDark} />
      </Screen>
    );
  }

  const date = new Date(quest.starts_at);
  const dateStr = date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isRestricted = quest.gender_restriction !== 'all';
  const isFull = quest.spots_left <= 0;

  return (
    <Screen style={styles.screen} edges={['top', 'left', 'right']}>
      {/* Golden header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <RetroTitle size={FontSize.lg}>{quest.title}</RetroTitle>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Category + restriction badges */}
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{quest.category.toUpperCase()}</Text>
          </View>
          {isRestricted && (
            <View style={styles.restrictedBadge}>
              <Text style={styles.restrictedText}>👥 MY GENDER</Text>
            </View>
          )}
          <View style={styles.spotsBadge}>
            <Text style={styles.spotsText}>
              {quest.spots_left} SPOT{quest.spots_left !== 1 ? 'S' : ''} LEFT
            </Text>
          </View>
        </View>

        {/* Meta info card */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={16} color={Colors.primaryDark} />
            <Text style={styles.metaText}>{quest.neighborhood}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaRow}>
            <Ionicons name="calendar" size={16} color={Colors.primaryDark} />
            <Text style={styles.metaText}>{dateStr}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaRow}>
            <Ionicons name="time" size={16} color={Colors.primaryDark} />
            <Text style={styles.metaText}>{timeStr}</Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <SectionLabel>BRIEFING</SectionLabel>
          <View style={styles.descCard}>
            <Text style={styles.description}>{quest.description}</Text>
          </View>
        </View>

        {/* Creator */}
        <View style={styles.section}>
          <SectionLabel>HOSTED BY</SectionLabel>
          <TouchableOpacity
            style={styles.creatorCard}
            onPress={() => handleUserPress(quest.creator_id)}
            activeOpacity={0.75}
          >
            <UserAvatar
              name={quest.creator_first_name}
              photo={quest.creator_photo_url}
              size={48}
              verified={quest.creator_verified}
            />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>{quest.creator_first_name}</Text>
              <Text style={styles.creatorMeta}>
                {quest.creator_rating_avg != null
                  ? `★ ${quest.creator_rating_avg.toFixed(1)}`
                  : 'No ratings yet'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <SectionLabel>{`ADVENTURERS · ${quest.current_count}/${quest.max_participants}`}</SectionLabel>
          <View style={styles.participantsCard}>
            {quest.participants.length === 0 ? (
              <Text style={styles.emptyParticipants}>No one has joined yet — be the first!</Text>
            ) : (
              quest.participants.map((p, i) => (
                <View key={p.user_id}>
                  {i > 0 && <View style={styles.participantDivider} />}
                  <ParticipantRow p={p} onPress={() => handleUserPress(p.user_id)} />
                </View>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed action bar */}
      <View style={styles.actionBar}>
        {isCreator ? (
          <View style={styles.actionStack}>
            <Button label="OPEN CHAT" onPress={handleOpenChat} />
            <TouchableOpacity onPress={handleDelete} disabled={acting} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>{acting ? 'DELETING…' : 'DELETE QUEST'}</Text>
            </TouchableOpacity>
          </View>
        ) : isMember ? (
          <View style={styles.actionStack}>
            <Button label="OPEN CHAT" onPress={handleOpenChat} />
            <TouchableOpacity onPress={handleLeave} disabled={acting} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>{acting ? 'LEAVING…' : 'LEAVE QUEST'}</Text>
            </TouchableOpacity>
          </View>
        ) : isFull ? (
          <Button label="QUEST FULL" onPress={() => {}} disabled variant="ghost" />
        ) : (
          <Button label={acting ? 'JOINING…' : 'JOIN QUEST'} onPress={handleJoin} disabled={acting} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: Spacing.lg },
  loadingHeader: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  loader: { flex: 1 },

  // Golden header
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
  // Badges row
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  categoryBadge: {
    backgroundColor: `${Colors.primaryDark}33`,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.primaryDark,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  categoryText: { color: Colors.text, fontSize: FontSize.xs, fontWeight: '800' },
  restrictedBadge: {
    backgroundColor: `${Colors.primary}33`,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  restrictedText: { color: Colors.text, fontSize: FontSize.xs, fontWeight: '800' },
  spotsBadge: {
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  spotsText: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '800' },

  // Meta card
  metaCard: {
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
  },
  metaRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
  },
  metaDivider: { height: 2, backgroundColor: Colors.border },
  metaText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },

  // Sections
  section: { gap: Spacing.sm },

  descCard: {
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  description: { color: Colors.textSecondary, fontSize: FontSize.md, lineHeight: 24 },

  creatorCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  creatorInfo: { flex: 1, gap: 2 },
  creatorName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '800' },
  creatorMeta: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },

  participantsCard: {
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  participantRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  participantDivider: { height: 2, backgroundColor: Colors.border },
  participantInfo: { flex: 1, gap: 2 },
  participantName: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  participantMeta: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600' },
  emptyParticipants: {
    color: Colors.textMuted, fontSize: FontSize.sm, fontStyle: 'italic',
    padding: Spacing.md, textAlign: 'center',
  },

  // Action bar
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 4, borderTopColor: Colors.border,
    padding: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  actionStack: { gap: Spacing.sm },
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.error,
    borderRadius: Radius.sm,
    backgroundColor: `${Colors.error}18`,
  },
  deleteBtnText: { color: Colors.error, fontSize: FontSize.sm, fontWeight: '800', letterSpacing: 1 },
});

const sec = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  bar: { width: 4, height: 14, backgroundColor: Colors.primaryDark, borderRadius: 0 },
  text: {
    color: Colors.text, fontSize: FontSize.xs, fontWeight: '900',
    letterSpacing: 2, textTransform: 'uppercase',
  },
});
