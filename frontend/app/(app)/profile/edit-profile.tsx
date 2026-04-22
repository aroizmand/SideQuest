import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useOwnProfile } from '@/hooks/useOwnProfile';
import { supabase } from '@/lib/supabase';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import type { Gender } from '@/types/user';

const GENDERS: { label: string; value: Gender }[] = [
  { label: 'Man', value: 'man' },
  { label: 'Woman', value: 'woman' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile } = useOwnProfile();

  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill once profile loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setAge(String(profile.age));
      setGender(profile.gender);
    }
  }, [profile?.user_id]);

  async function handleSave() {
    const ageNum = parseInt(age, 10);
    if (!firstName.trim()) { setError('First name is required.'); return; }
    if (isNaN(ageNum) || ageNum < 18) { setError('You must be 18 or older.'); return; }
    if (!gender) { setError('Please select a gender.'); return; }
    setError('');
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { error: updateError } = await supabase
      .from('dim_user')
      .update({ first_name: firstName.trim(), age: ageNum, gender })
      .eq('user_id', user.id);

    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    router.back();
  }

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="First name" value={firstName} onChangeText={setFirstName} placeholder="Alex" autoFocus />

        <Input
          label="Age"
          value={age}
          onChangeText={(v) => setAge(v.replace(/\D/g, ''))}
          placeholder="25"
          keyboardType="number-pad"
        />

        <View>
          <Text style={styles.label}>I identify as</Text>
          <View style={styles.genderGrid}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.chip, gender === g.value && styles.chipActive]}
                onPress={() => setGender(g.value)}
              >
                <Text style={[styles.chipText, gender === g.value && styles.chipTextActive]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label="Save Changes"
          onPress={handleSave}
          loading={loading}
          disabled={!firstName || !age || !gender}
        />
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
  content: { padding: Spacing.lg, gap: Spacing.lg },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '500', marginBottom: Spacing.sm },
  genderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  chipTextActive: { color: Colors.text, fontWeight: '600' },
  error: { color: Colors.error, fontSize: FontSize.sm },
});
