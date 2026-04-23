import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { DateTimePicker } from '@/components/DateTimePicker';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useCreateQuest } from '@/hooks/useCreateQuest';
import { useCategories } from '@/hooks/useCategories';
import { useProfileStore } from '@/stores/profileStore';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import type { Gender } from '@/types/user';

const GENDER_LABELS: Record<Gender, string> = {
  man: 'Men',
  woman: 'Women',
  non_binary: 'Non-binary people',
  prefer_not_to_say: 'my gender',
};

const EMPTY_FORM = {
  title: '',
  description: '',
  neighborhood: '',
  startsAt: null as Date | null,
  maxParticipants: '6',
  categoryId: null as number | null,
  myGenderOnly: false,
  error: '',
};

export default function CreateScreen() {
  const router = useRouter();
  const { createQuest, loading, error: createError } = useCreateQuest();
  const { categories } = useCategories();
  const myGender = useProfileStore(s => s.profile?.gender as Gender | undefined) ?? null;

  const [title, setTitle] = useState(EMPTY_FORM.title);
  const [description, setDescription] = useState(EMPTY_FORM.description);
  const [neighborhood, setNeighborhood] = useState(EMPTY_FORM.neighborhood);
  const [startsAt, setStartsAt] = useState<Date | null>(EMPTY_FORM.startsAt);
  const [maxParticipants, setMaxParticipants] = useState(EMPTY_FORM.maxParticipants);
  const [categoryId, setCategoryId] = useState<number | null>(EMPTY_FORM.categoryId);
  const [myGenderOnly, setMyGenderOnly] = useState(EMPTY_FORM.myGenderOnly);
  const [error, setError] = useState(EMPTY_FORM.error);

  const maxCount = parseInt(maxParticipants, 10) || 6;

  function resetForm() {
    setTitle(EMPTY_FORM.title);
    setDescription(EMPTY_FORM.description);
    setNeighborhood(EMPTY_FORM.neighborhood);
    setStartsAt(EMPTY_FORM.startsAt);
    setMaxParticipants(EMPTY_FORM.maxParticipants);
    setCategoryId(EMPTY_FORM.categoryId);
    setMyGenderOnly(EMPTY_FORM.myGenderOnly);
    setError(EMPTY_FORM.error);
  }

  async function handleCreate() {
    if (!title.trim() || !description.trim() || !neighborhood.trim() || !startsAt || !categoryId) {
      setError('Fill in all fields and pick a category.');
      return;
    }
    if (title.trim().length < 5) { setError('Title must be at least 5 characters.'); return; }
    if (description.trim().length < 20) { setError(`Description needs ${20 - description.trim().length} more characters.`); return; }
    if (description.trim().length > 500) { setError('Description must be under 500 characters.'); return; }
    if (startsAt <= new Date()) { setError('Choose a future date and time.'); return; }
    if (maxCount < 2 || maxCount > 6) { setError('Participants must be between 2 and 6.'); return; }
    setError('');

    const quest = await createQuest({
      title: title.trim(),
      description: description.trim(),
      neighborhood: neighborhood.trim(),
      starts_at: startsAt.toISOString(),
      max_participants: maxCount,
      category_id: categoryId,
      gender_restriction: myGenderOnly && myGender ? myGender : 'all',
    });

    if (quest) {
      resetForm();
      router.push('/(app)/my-quests');
    }
  }

  const genderLabel = myGender ? GENDER_LABELS[myGender] : 'my gender';

  return (
    <Screen>
      <View style={styles.stickyHeader}>
        <Text style={styles.title}>Post a Quest</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Input label="Title" value={title} onChangeText={setTitle} placeholder="Saturday hike at Nose Hill" />

        <View>
          <Input
            label="Description"
            value={description}
            onChangeText={(t) => setDescription(t.slice(0, 500))}
            placeholder="What's the plan? What should people bring?"
            multiline
            numberOfLines={3}
          />
          <Text style={styles.charCount}>{description.length}/500{description.length < 20 ? ` (min 20)` : ''}</Text>
        </View>

        <Input label="Neighborhood" value={neighborhood} onChangeText={setNeighborhood} placeholder="Kensington" />

        <View>
          <Text style={styles.label}>Date & time</Text>
          <DateTimePicker value={startsAt} onChange={setStartsAt} />
        </View>

        <View>
          <Text style={styles.label}>Max participants (2–6)</Text>
          <View style={styles.countRow}>
            {[2, 3, 4, 5, 6].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.countChip, maxCount === n && styles.countChipActive]}
                onPress={() => setMaxParticipants(String(n))}
              >
                <Text style={[styles.countText, maxCount === n && styles.countTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipGrid}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.category_id}
                style={[styles.chip, categoryId === c.category_id && styles.chipActive]}
                onPress={() => setCategoryId(c.category_id)}
              >
                <Text style={[styles.chipText, categoryId === c.category_id && styles.chipTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.label}>Who can see this quest?</Text>
          <View style={styles.visibilityRow}>
            <TouchableOpacity
              style={[styles.visChip, !myGenderOnly && styles.visChipActive]}
              onPress={() => setMyGenderOnly(false)}
            >
              <Text style={[styles.visChipText, !myGenderOnly && styles.visChipTextActive]}>Everyone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visChip, myGenderOnly && styles.visChipActive]}
              onPress={() => setMyGenderOnly(true)}
            >
              <Text style={[styles.visChipText, myGenderOnly && styles.visChipTextActive]}>
                {genderLabel} only
              </Text>
            </TouchableOpacity>
          </View>
          {myGenderOnly && (
            <Text style={styles.visHint}>
              Only people who identify as {genderLabel.toLowerCase()} will see this quest.
            </Text>
          )}
        </View>

        {(error || createError) ? <Text style={styles.error}>{error || createError}</Text> : null}
        <Button
          label="Post Quest"
          onPress={handleCreate}
          loading={loading}
          disabled={!title || !description || !neighborhood || !startsAt || !categoryId}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '700' },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '500', marginBottom: Spacing.sm },
  countRow: { flexDirection: 'row', gap: Spacing.sm },
  countChip: {
    width: 48, height: 48, borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  countChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  countText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
  countTextActive: { color: Colors.text },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  chipTextActive: { color: Colors.text, fontWeight: '600' },
  charCount: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'right', marginTop: 4 },
  visibilityRow: { flexDirection: 'row', gap: Spacing.sm },
  visChip: {
    flex: 1, paddingVertical: Spacing.sm, alignItems: 'center',
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
  },
  visChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  visChipText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '500' },
  visChipTextActive: { color: Colors.text, fontWeight: '600' },
  visHint: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: Spacing.xs },
  error: { color: Colors.error, fontSize: FontSize.sm },
});
