import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import type { Gender } from '@/types/user';

const GENDERS: { label: string; value: Gender }[] = [
  { label: 'Man', value: 'man' },
  { label: 'Woman', value: 'woman' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

async function sha256(text: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { phone, setProfile } = useOnboardingStore();
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleNext() {
    if (!firstName.trim() || !age || !gender) {
      setError('All fields are required.');
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18) {
      setError('You must be 18 or older.');
      return;
    }
    setError('');
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const phoneHash = phone ? await sha256(phone) : await sha256(user.id);

    const { error: upsertError } = await supabase.from('dim_user').upsert({
      user_id: user.id,
      phone_hash: phoneHash,
      first_name: firstName.trim(),
      photo_url: '',           // updated in selfie step; empty string satisfies NOT NULL
      age: ageNum,
      gender,
    });

    setLoading(false);
    if (upsertError) { setError(upsertError.message); return; }

    setProfile(firstName.trim(), age, gender);
    router.push('/(auth)/onboarding/add-photo');
  }

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tell us about you</Text>
        <Text style={styles.subtitle}>Only your first name and photo are shown to others.</Text>

        <Input label="First name" value={firstName} onChangeText={setFirstName} placeholder="Alex" autoFocus />

        <Input
          label="Age"
          value={age}
          onChangeText={(v) => setAge(v.replace(/\D/g, ''))}
          placeholder="25"
          keyboardType="number-pad"
        />

        <View style={styles.genderSection}>
          <Text style={styles.label}>I identify as</Text>
          <View style={styles.genderGrid}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.genderChip, gender === g.value && styles.genderChipActive]}
                onPress={() => setGender(g.value)}
              >
                <Text style={[styles.genderText, gender === g.value && styles.genderTextActive]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Continue" onPress={handleNext} loading={loading} disabled={!firstName || !age || !gender} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  backBtn: { padding: Spacing.sm },
  backText: { color: Colors.text, fontSize: FontSize.xl },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '700' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.md },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '500', marginBottom: Spacing.sm },
  genderSection: { gap: Spacing.xs },
  genderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  genderChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  genderChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  genderText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  genderTextActive: { color: Colors.text, fontWeight: '600' },
  error: { color: Colors.error, fontSize: FontSize.sm },
});
