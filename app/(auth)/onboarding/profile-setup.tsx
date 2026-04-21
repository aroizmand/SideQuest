import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { GENDER_OPTIONS } from '@/constants/options';

export default function ProfileSetupScreen() {
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setProfile } = useOnboardingStore();

  const isValid = firstName.trim().length >= 2 && Number(age) >= 18 && gender !== '';

  function proceed() {
    setProfile({ firstName: firstName.trim(), age: Number(age), gender });
    router.push('/(auth)/onboarding/tos-accept');
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>About you</Text>

      <Text style={styles.label}>First name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Alex"
        placeholderTextColor="#555"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
        autoFocus
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="Must be 18+"
        placeholderTextColor="#555"
        keyboardType="number-pad"
        maxLength={3}
        value={age}
        onChangeText={setAge}
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderRow}>
        {GENDER_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.genderChip, gender === opt.value && styles.genderChipActive]}
            onPress={() => setGender(opt.value)}
          >
            <Text style={[styles.genderChipText, gender === opt.value && styles.genderChipTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.button, !isValid && styles.buttonDisabled]} onPress={proceed} disabled={!isValid || loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Continue</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#0D0D0D', padding: 24, paddingTop: 60, minHeight: '100%' },
  title: { fontSize: 28, fontWeight: '700', color: '#FFF', marginBottom: 32 },
  label: { fontSize: 14, color: '#AAA', marginBottom: 8, marginTop: 20 },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', fontSize: 16, padding: 16, borderRadius: 12 },
  genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  genderChip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  genderChipActive: { backgroundColor: '#FF5C00', borderColor: '#FF5C00' },
  genderChipText: { color: '#AAA', fontSize: 14 },
  genderChipTextActive: { color: '#FFF', fontWeight: '600' },
  button: { backgroundColor: '#FF5C00', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
