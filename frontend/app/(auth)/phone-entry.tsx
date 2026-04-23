import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

const DIAL_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

function formatPhoneNumber(digits: string): string {
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function DialPad({ onDigit, onDelete }: { onDigit: (d: string) => void; onDelete: () => void }) {
  return (
    <View style={dp.pad}>
      {DIAL_ROWS.map((row, ri) => (
        <View key={ri} style={dp.row}>
          {row.map((key, ki) => {
            if (key === '') return <View key={ki} style={dp.keyEmpty} />;
            const isDelete = key === '⌫';
            return (
              <TouchableOpacity
                key={ki}
                style={[dp.key, isDelete && dp.deleteKey]}
                onPress={() => isDelete ? onDelete() : onDigit(key)}
                activeOpacity={0.6}
              >
                <Text style={[dp.keyText, isDelete && dp.deleteText]}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default function PhoneEntryScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isLogin = mode === 'login';
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [digits, setDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  function handleDigit(d: string) {
    if (digits.length >= 10) return;
    setDigits(prev => prev + d);
    setError('');
  }

  function handleDelete() {
    setDigits(prev => prev.slice(0, -1));
    setError('');
  }

  async function handleSendOTP() {
    if (digits.length < 10) { setError('Enter a valid 10-digit number.'); return; }
    setError('');
    setLoading(true);
    const fullNumber = `${selectedCountry.code}${digits}`;
    const { error: supaError } = await supabase.auth.signInWithOtp({ phone: fullNumber });
    setLoading(false);
    if (supaError) { setError(supaError.message); return; }
    router.push({ pathname: '/(auth)/otp-verify', params: { phone: fullNumber, mode: mode ?? 'signup' } });
  }

  const formatted = formatPhoneNumber(digits);
  const placeholder = '(___) ___-____';

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Top content */}
      <View style={styles.content}>
        <Text style={styles.title}>{isLogin ? `Welcome\nback!` : `What's your\nnumber?`}</Text>
        <Text style={styles.subtitle}>We'll text you a one-time code.</Text>

        {/* Country + display */}
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.countryBtn} onPress={() => setShowPicker(true)}>
            <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
            <Text style={styles.countryCode}>{selectedCountry.code}</Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>

          <View style={styles.phoneDisplay}>
            <Text style={[styles.phoneText, !formatted && styles.phonePlaceholder]}>
              {formatted || placeholder}
            </Text>
            {/* blinking cursor effect */}
            {digits.length < 10 && (
              <View style={styles.cursor} />
            )}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {/* Dial pad + send */}
      <View style={styles.padSection}>
        <DialPad onDigit={handleDigit} onDelete={handleDelete} />
        <View style={styles.actions}>
          <Button
            label={loading ? 'Sending…' : 'Send Code'}
            onPress={handleSendOTP}
            loading={loading}
            disabled={digits.length < 10 || loading}
          />
        </View>
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
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  backBtn: { padding: Spacing.sm },
  backText: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },

  content: {
    flex: 1, justifyContent: 'center',
    paddingHorizontal: Spacing.lg, gap: Spacing.md,
  },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800', lineHeight: 34 },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600' },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  countryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    height: 56, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border, borderRadius: Radius.sm,
  },
  countryFlag: { fontSize: 22 },
  countryCode: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  chevron: { color: Colors.textMuted, fontSize: 12 },

  phoneDisplay: {
    flex: 1, height: 56, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, gap: 2,
  },
  phoneText: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 1 },
  phonePlaceholder: { color: Colors.textMuted, fontWeight: '600' },
  cursor: {
    width: 2, height: 24,
    backgroundColor: Colors.text,
    marginLeft: 1,
  },

  error: { color: Colors.error, fontSize: FontSize.sm, fontWeight: '700' },

  padSection: { paddingBottom: Spacing.lg },
  actions: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },

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

const dp = StyleSheet.create({
  pad: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.sm },
  keyEmpty: { flex: 1 },
  key: {
    flex: 1, height: 56,
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteKey: {
    backgroundColor: `${Colors.error}22`,
  },
  keyText: {
    color: Colors.text, fontSize: FontSize.xl, fontWeight: '800',
  },
  deleteText: {
    color: Colors.error, fontSize: FontSize.lg,
  },
});
