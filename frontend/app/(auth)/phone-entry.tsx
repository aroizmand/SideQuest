import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

const COUNTRIES = [
  { code: '+1',  flag: '🇺🇸', name: 'United States' },
  { code: '+1',  flag: '🇨🇦', name: 'Canada' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
];

function formatPhoneNumber(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export default function PhoneEntryScreen() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [digits, setDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  function handlePhoneChange(text: string) {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setDigits(cleaned);
  }

  async function handleSendOTP() {
    if (digits.length < 10) { setError('Enter a valid 10-digit number.'); return; }
    setError('');
    setLoading(true);
    const fullNumber = `${selectedCountry.code}${digits}`;
    const { error: supaError } = await supabase.auth.signInWithOtp({ phone: fullNumber });
    setLoading(false);
    if (supaError) { setError(supaError.message); return; }
    router.push({ pathname: '/(auth)/otp-verify', params: { phone: fullNumber } });
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What's your number?</Text>
        <Text style={styles.subtitle}>We'll text you a one-time code.</Text>

        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.countryBtn} onPress={() => setShowPicker(true)}>
            <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
            <Text style={styles.countryCode}>{selectedCountry.code}</Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.phoneInput}
            value={formatPhoneNumber(digits)}
            onChangeText={handlePhoneChange}
            placeholder="(555) 000-0000"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            autoFocus
            selectionColor={Colors.primary}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.actions}>
        <Button
          label="Send Code"
          onPress={handleSendOTP}
          loading={loading}
          disabled={digits.length < 10}
        />
      </View>

      <Modal visible={showPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select country</Text>
          <FlatList
            data={COUNTRIES}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryRow}
                onPress={() => { setSelectedCountry(item); setShowPicker(false); }}
              >
                <Text style={styles.countryRowFlag}>{item.flag}</Text>
                <Text style={styles.countryRowName}>{item.name}</Text>
                <Text style={styles.countryRowCode}>{item.code}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </Screen>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'space-between' },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  backBtn: { padding: Spacing.sm },
  backText: { color: Colors.text, fontSize: FontSize.xl },
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '700' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.md },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  countryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    height: 56, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  countryFlag: { fontSize: 22 },
  countryCode: { color: Colors.text, fontSize: FontSize.md, fontWeight: '500' },
  chevron: { color: Colors.textMuted, fontSize: 12 },
  phoneInput: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.lg,
  },
  error: { color: Colors.error, fontSize: FontSize.sm },
  actions: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  modalOverlay: { flex: 1, backgroundColor: '#00000066' },
  modalSheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg, padding: Spacing.lg, maxHeight: '60%',
  },
  modalTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  countryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  countryRowFlag: { fontSize: 22 },
  countryRowName: { flex: 1, color: Colors.text, fontSize: FontSize.md },
  countryRowCode: { color: Colors.textSecondary, fontSize: FontSize.sm },
});
