import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CATEGORIES } from '@/constants/categories';
import { GENDER_RESTRICTION_OPTIONS } from '@/constants/options';
import { useCreateQuest } from '@/hooks/useCreateQuest';

export default function CreateQuestScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [ageMin, setAgeMin] = useState('18');
  const [ageMax, setAgeMax] = useState('');
  const [genderRestriction, setGenderRestriction] = useState('all');
  const router = useRouter();
  const { create, creating, error } = useCreateQuest();

  const isValid = title.trim().length >= 5 && description.trim().length >= 20 && category && startsAt && Number(maxParticipants) >= 2;

  async function submit() {
    const quest = await create({ title, description, category, startsAt, maxParticipants: Number(maxParticipants), ageMin: Number(ageMin), ageMax: ageMax ? Number(ageMax) : null, genderRestriction });
    if (quest) router.replace('/(app)/feed');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>New SideQuest</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Sunrise hike on Chief Mountain" placeholderTextColor="#555" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} placeholder="What are we doing? What to bring? Fitness level?" placeholderTextColor="#555" multiline numberOfLines={4} />

      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {CATEGORIES.map((cat) => (
          <Pressable key={cat.id} style={[styles.chip, category === cat.name && styles.chipActive]} onPress={() => setCategory(cat.name)}>
            <Text style={[styles.chipText, category === cat.name && styles.chipTextActive]}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.label}>Date & Time (ISO format)</Text>
      <TextInput style={styles.input} value={startsAt} onChangeText={setStartsAt} placeholder="2026-04-22T08:00:00" placeholderTextColor="#555" />

      <Text style={styles.label}>Max Participants (2–20)</Text>
      <TextInput style={styles.input} value={maxParticipants} onChangeText={setMaxParticipants} keyboardType="number-pad" maxLength={2} placeholder="e.g. 6" placeholderTextColor="#555" />

      <Text style={styles.label}>Age Restriction (optional)</Text>
      <View style={styles.row}>
        <TextInput style={[styles.input, styles.halfInput]} value={ageMin} onChangeText={setAgeMin} keyboardType="number-pad" maxLength={3} placeholder="Min" placeholderTextColor="#555" />
        <TextInput style={[styles.input, styles.halfInput]} value={ageMax} onChangeText={setAgeMax} keyboardType="number-pad" maxLength={3} placeholder="Max" placeholderTextColor="#555" />
      </View>

      <Text style={styles.label}>Gender Restriction</Text>
      <View style={styles.chipRow}>
        {GENDER_RESTRICTION_OPTIONS.map((opt) => (
          <Pressable key={opt.value} style={[styles.chip, genderRestriction === opt.value && styles.chipActive]} onPress={() => setGenderRestriction(opt.value)}>
            <Text style={[styles.chipText, genderRestriction === opt.value && styles.chipTextActive]}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.button, (!isValid || creating) && styles.buttonDisabled]} onPress={submit} disabled={!isValid || creating}>
        {creating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Post SideQuest</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 24 },
  label: { fontSize: 13, color: '#AAA', marginBottom: 8, marginTop: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', fontSize: 15, padding: 14, borderRadius: 10 },
  multiline: { height: 100, textAlignVertical: 'top' },
  chipScroll: { marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#333', marginRight: 8 },
  chipActive: { backgroundColor: '#FF5C00', borderColor: '#FF5C00' },
  chipText: { color: '#AAA', fontSize: 13 },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  error: { color: '#FF4444', marginTop: 12, fontSize: 14 },
  button: { backgroundColor: '#FF5C00', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
