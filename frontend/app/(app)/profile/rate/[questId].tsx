import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { UserAvatar } from '@/components/UserAvatar';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

const TAGS = [
  { id: 'showed_up',    label: 'Showed up' },
  { id: 'great_energy', label: 'Great energy' },
  { id: 'felt_safe',    label: 'Felt safe' },
  { id: 'no_show',      label: 'No-show' },
] as const;

type TagId = typeof TAGS[number]['id'];

type Participant = {
  user_id: string;
  first_name: string;
  photo_url: string | null;
  age: number;
  already_rated: boolean;
};

type RatingState = {
  score: number;
  tags: TagId[];
  submitting: boolean;
  submitted: boolean;
};

function StarRow({ score, onChange }: { score: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.7}>
          <Text style={[styles.star, n <= score && styles.starActive]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function TagChips({
  selected, onChange,
}: { selected: TagId[]; onChange: (tags: TagId[]) => void }) {
  function toggle(id: TagId) {
    onChange(selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id]);
  }
  return (
    <View style={styles.tagRow}>
      {TAGS.map((tag) => {
        const active = selected.includes(tag.id);
        return (
          <TouchableOpacity
            key={tag.id}
            onPress={() => toggle(tag.id)}
            activeOpacity={0.75}
            style={[styles.tagChip, active && styles.tagChipActive]}
          >
            <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
              {tag.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={sec.row}>
      <View style={sec.bar} />
      <Text style={sec.text}>{children}</Text>
    </View>
  );
}

export default function RateQuestScreen() {
  const router = useRouter();
  const { questId, title } = useLocalSearchParams<{ questId: string; title: string }>();
  const userId = useAuthStore.getState().session?.user.id;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, RatingState>>({});

  useEffect(() => { loadParticipants(); }, [questId]);

  async function loadParticipants() {
    if (!userId || !questId) return;

    const { data: memberRows } = await supabase
      .from('fact_quest_memberships')
      .select('user_id')
      .eq('quest_id', questId)
      .is('left_at', null);

    const otherIds = (memberRows ?? [])
      .map((m: any) => m.user_id)
      .filter((id: string) => id !== userId);

    const { data: questRow } = await supabase
      .from('dim_quest')
      .select('creator_id')
      .eq('quest_id', questId)
      .single();

    const creatorId = (questRow as any)?.creator_id;
    if (creatorId && creatorId !== userId && !otherIds.includes(creatorId)) {
      otherIds.push(creatorId);
    }

    if (otherIds.length === 0) { setLoading(false); return; }

    const [{ data: profiles }, { data: existingRatings }] = await Promise.all([
      supabase
        .from('v_user_public_profile')
        .select('user_id, first_name, photo_url, age')
        .in('user_id', otherIds),
      supabase
        .from('fact_ratings')
        .select('to_user_id')
        .eq('from_user_id', userId)
        .eq('quest_id', questId),
    ]);

    const ratedSet = new Set((existingRatings ?? []).map((r: any) => r.to_user_id));

    const list: Participant[] = (profiles ?? []).map((p: any) => ({
      user_id: p.user_id,
      first_name: p.first_name,
      photo_url: p.photo_url,
      age: p.age,
      already_rated: ratedSet.has(p.user_id),
    }));

    setParticipants(list);

    const initial: Record<string, RatingState> = {};
    list.forEach((p) => {
      initial[p.user_id] = { score: 0, tags: [], submitting: false, submitted: p.already_rated };
    });
    setRatings(initial);
    setLoading(false);
  }

  function setScore(participantId: string, score: number) {
    setRatings((prev) => ({ ...prev, [participantId]: { ...prev[participantId], score } }));
  }

  function setTags(participantId: string, tags: TagId[]) {
    setRatings((prev) => ({ ...prev, [participantId]: { ...prev[participantId], tags } }));
  }

  async function submitRating(participant: Participant) {
    const r = ratings[participant.user_id];
    if (!r || r.score === 0) {
      Alert.alert('Pick a rating', 'Tap a star before submitting.');
      return;
    }

    setRatings((prev) => ({
      ...prev,
      [participant.user_id]: { ...prev[participant.user_id], submitting: true },
    }));

    // Look up date_id for today
    const today = new Date().toISOString().split('T')[0];
    const { data: dateRow } = await supabase
      .from('dim_date')
      .select('date_id')
      .eq('full_date', today)
      .single();

    const payload: Record<string, any> = {
      from_user_id: userId,
      to_user_id: participant.user_id,
      quest_id: questId,
      score: r.score,
      tags: r.tags,
    };
    if (dateRow?.date_id) payload.date_id = dateRow.date_id;

    const { error } = await supabase.from('fact_ratings').insert(payload);

    if (error) {
      Alert.alert('Error', error.message);
      setRatings((prev) => ({
        ...prev,
        [participant.user_id]: { ...prev[participant.user_id], submitting: false },
      }));
      return;
    }

    setRatings((prev) => ({
      ...prev,
      [participant.user_id]: { ...prev[participant.user_id], submitting: false, submitted: true },
    }));
  }

  const allDone = participants.length > 0 &&
    participants.every((p) => ratings[p.user_id]?.submitted);

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEyebrow}>— RATE YOUR CREW —</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{title ?? 'QUEST'}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primaryDark} />
      ) : participants.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🧭</Text>
          <Text style={styles.emptyTitle}>No one to rate</Text>
          <Text style={styles.emptySubtitle}>You were the only one on this quest.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {allDone && (
            <View style={styles.allDoneBanner}>
              <Text style={styles.allDoneText}>✓ ALL RATINGS SUBMITTED</Text>
            </View>
          )}

          <SectionLabel>ADVENTURERS</SectionLabel>

          {participants.map((p) => {
            const r = ratings[p.user_id];
            if (!r) return null;
            return (
              <View key={p.user_id} style={styles.card}>
                <View style={styles.participantHeader}>
                  <UserAvatar name={p.first_name} photo={p.photo_url} size={44} />
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{p.first_name}</Text>
                    <Text style={styles.participantAge}>{p.age} years old</Text>
                  </View>
                  {r.submitted && (
                    <View style={styles.ratedBadge}>
                      <Text style={styles.ratedBadgeText}>RATED ✓</Text>
                    </View>
                  )}
                </View>

                {r.submitted ? (
                  <Text style={styles.submittedNote}>Rating submitted — thanks!</Text>
                ) : (
                  <>
                    <View style={styles.cardDivider} />
                    <StarRow score={r.score} onChange={(n) => setScore(p.user_id, n)} />
                    <TagChips selected={r.tags} onChange={(t) => setTags(p.user_id, t)} />
                    <TouchableOpacity
                      style={[styles.submitBtn, r.score === 0 && styles.submitBtnDisabled]}
                      onPress={() => submitRating(p)}
                      disabled={r.submitting || r.score === 0}
                      activeOpacity={0.75}
                    >
                      {r.submitting ? (
                        <ActivityIndicator size="small" color={Colors.text} />
                      ) : (
                        <Text style={styles.submitBtnText}>SUBMIT RATING</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          })}

          {allDone && (
            <Button label="BACK TO PROFILE" onPress={() => router.back()} />
          )}

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      )}
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
    color: Colors.text, fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 2, opacity: 0.7,
  },
  headerTitle: {
    color: Colors.text, fontSize: FontSize.lg, fontWeight: '900', letterSpacing: 1,
  },

  content: { padding: Spacing.lg, gap: Spacing.md },

  allDoneBanner: {
    backgroundColor: `${Colors.success}22`,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.success,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    alignItems: 'center',
  },
  allDoneText: { color: Colors.success, fontSize: FontSize.sm, fontWeight: '800', letterSpacing: 1 },

  card: {
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  participantHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  participantInfo: { flex: 1, gap: 2 },
  participantName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '800' },
  participantAge: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600' },
  ratedBadge: {
    backgroundColor: `${Colors.success}22`,
    borderWidth: 1, borderColor: Colors.success,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs, paddingVertical: 3,
  },
  ratedBadgeText: { color: Colors.success, fontSize: 10, fontWeight: '800' },
  cardDivider: { height: 2, backgroundColor: Colors.border },

  starRow: { flexDirection: 'row', gap: Spacing.xs },
  star: { fontSize: 32, color: Colors.border },
  starActive: { color: Colors.primaryDark },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tagChip: {
    borderTopWidth: 1, borderLeftWidth: 1, borderBottomWidth: 2, borderRightWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 5,
    backgroundColor: Colors.background,
  },
  tagChipActive: {
    borderColor: Colors.primaryDark,
    backgroundColor: `${Colors.primaryDark}33`,
  },
  tagChipText: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
  tagChipTextActive: { color: Colors.text },

  submitBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderTopWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryDark,
  },
  submitBtnDisabled: { backgroundColor: Colors.surface, borderColor: Colors.border },
  submitBtnText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '800', letterSpacing: 1 },
  submittedNote: {
    color: Colors.textMuted, fontSize: FontSize.sm, fontStyle: 'italic', textAlign: 'center',
    paddingVertical: Spacing.xs,
  },

  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800' },
  emptySubtitle: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center' },
});

const sec = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  bar: { width: 4, height: 14, backgroundColor: Colors.primaryDark, borderRadius: 0 },
  text: {
    color: Colors.text, fontSize: FontSize.xs, fontWeight: '900',
    letterSpacing: 2, textTransform: 'uppercase',
  },
});
