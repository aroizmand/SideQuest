import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={sec.row}>
      <View style={sec.bar} />
      <Text style={sec.text}>{children}</Text>
    </View>
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile } = useOwnProfile();

  const [firstName, setFirstName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setBio(profile.bio ?? '');
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
      .update({ first_name: firstName.trim(), bio: bio.trim() || null, age: ageNum, gender })
      .eq('user_id', user.id);

    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    router.back();
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEyebrow}>— YOUR INFO —</Text>
          <Text style={styles.headerTitle}>EDIT PROFILE</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.section}>
          <SectionLabel>FIRST NAME</SectionLabel>
          <Input value={firstName} onChangeText={setFirstName} placeholder="Alex" autoFocus />
        </View>

        <View style={styles.section}>
          <SectionLabel>BIO</SectionLabel>
          <Input
            value={bio}
            onChangeText={(t) => setBio(t.slice(0, 150))}
            placeholder="Tell people a bit about yourself…"
            multiline
            numberOfLines={2}
          />
          <Text style={styles.charCount}>{bio.length}/150</Text>
        </View>

        <View style={styles.section}>
          <SectionLabel>AGE</SectionLabel>
          <Input
            value={age}
            onChangeText={(v) => setAge(v.replace(/\D/g, ''))}
            placeholder="25"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <SectionLabel>I IDENTIFY AS</SectionLabel>
          <View style={styles.chipGrid}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.chip, gender === g.value && styles.chipActive]}
                onPress={() => setGender(g.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, gender === g.value && styles.chipTextActive]}>
                  {g.label.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Button
          label="SAVE CHANGES"
          onPress={handleSave}
          loading={loading}
          disabled={!firstName || !age || !gender}
        />

        <View style={{ height: Spacing.lg }} />
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

  content: { padding: Spacing.lg, gap: Spacing.lg },
  section: { gap: Spacing.sm },
  charCount: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 2,
  },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  chipActive: { backgroundColor: Colors.primaryDark },
  chipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chipTextActive: { color: Colors.text },

  errorBox: {
    backgroundColor: `${Colors.error}22`,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.error,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  errorText: { color: Colors.error, fontSize: FontSize.sm, fontWeight: '700' },
});

const sec = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
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
