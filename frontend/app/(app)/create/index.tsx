import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { DateTimePicker } from '@/components/DateTimePicker';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useCreateQuest } from '@/hooks/useCreateQuest';
import { useCategories } from '@/hooks/useCategories';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export default function CreateScreen() {
  const router = useRouter();
  const { createQuest, loading, error: createError } = useCreateQuest();
  const { categories } = useCategories();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [startsAt, setStartsAt] = useState<Date | null>(null);
  const [maxParticipants, setMaxParticipants] = useState('6');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const maxCount = parseInt(maxParticipants, 10) || 6;

  async function handleCreate() {
    if (!title.trim() || !description.trim() || !neighborhood.trim() || !startsAt || !categoryId) {
      setError('Fill in all fields and pick a category.');
      return;
    }
    if (title.trim().length < 5) { setError('Title must be at least 5 characters.'); return; }
    if (description.trim().length < 20) { setError(`Description needs ${20 - description.trim().length} more characters.`); return; }
    if (description.trim().length > 500) { setError('Description must be under 500 characters.'); return; }
    if (startsAt <= new Date()) { setError('Choose a future date and time.'); return; }
    if (maxCount < 2 || maxCount > 10) { setError('Participants must be between 2 and 10.'); return; }
    setError('');
    const quest = await createQuest({
      title: title.trim(),
      description: description.trim(),
      neighborhood: neighborhood.trim(),
      starts_at: startsAt.toISOString(),
      max_participants: maxCount,
      category_id: categoryId,
    });
    if (quest) router.push('/(app)/my-quests');
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>New Quest</Text>

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
          <Text style={styles.label}>Max participants (2–10)</Text>
          <View style={styles.countRow}>
            {[2, 4, 6, 8, 10].map((n) => (
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

        {(error || createError) ? <Text style={styles.error}>{error || createError}</Text> : null}
        <Button
          label="Create Quest"
          onPress={handleCreate}
          loading={loading}
          disabled={!title || !description || !neighborhood || !startsAt || !categoryId}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.lg },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '700' },
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
  error: { color: Colors.error, fontSize: FontSize.sm },
});
