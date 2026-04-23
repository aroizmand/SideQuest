import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

const CODE_LENGTH = 6;

const DIAL_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

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

export default function OTPVerifyScreen() {
  const { phone, mode } = useLocalSearchParams<{ phone: string; mode?: string }>();
  const isLogin = mode === 'login';
  const router = useRouter();
  const { setSession } = useAuthStore();
  const { setPhone } = useOnboardingStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleDigit(d: string) {
    if (code.length >= CODE_LENGTH) return;
    setCode(prev => prev + d);
    setError('');
  }

  function handleDelete() {
    setCode(prev => prev.slice(0, -1));
    setError('');
  }

  async function handleVerify() {
    if (code.length < CODE_LENGTH) return;
    setError('');
    setLoading(true);

    const { data, error: supaError } = await supabase.auth.verifyOtp({
      phone: phone ?? '',
      token: code,
      type: 'sms',
    });

    if (supaError || !data.session) {
      setLoading(false);
      setError('Invalid code. Please try again.');
      setCode('');
      return;
    }

    // Check whether this user already has a profile
    const { data: existingProfile } = await supabase
      .from('dim_user')
      .select('user_id')
      .eq('user_id', data.session.user.id)
      .maybeSingle();

    setLoading(false);
    const hasExistingProfile = !!existingProfile;

    if (isLogin && !hasExistingProfile) {
      setError('No account found for this number. Please sign up first.');
      setCode('');
      await supabase.auth.signOut();
      return;
    }

    setSession(data.session);
    setPhone(phone ?? '');

    if (hasExistingProfile) {
      // Returning user — skip onboarding regardless of mode
      router.replace('/(app)/feed');
    } else {
      router.replace('/(auth)/onboarding/profile-setup');
    }
  }

  const digits = code.split('');

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{isLogin ? `Welcome\nback!` : `Enter the\ncode`}</Text>
        <Text style={styles.subtitle}>Sent to {phone}</Text>

        <View style={styles.codeRow}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <View key={i} style={[styles.digitBox, i === digits.length && styles.digitBoxActive]}>
              <Text style={styles.digit}>{digits[i] ?? ''}</Text>
            </View>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.padSection}>
        <DialPad onDigit={handleDigit} onDelete={handleDelete} />
        <View style={styles.actions}>
          <Button
            label={loading ? 'Verifying…' : 'Verify'}
            onPress={handleVerify}
            loading={loading}
            disabled={code.length < CODE_LENGTH || loading}
          />
        </View>
      </View>
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
    paddingHorizontal: Spacing.lg, gap: Spacing.md, alignItems: 'center',
  },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800', lineHeight: 34, alignSelf: 'flex-start' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600', alignSelf: 'flex-start' },

  codeRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', marginTop: Spacing.sm },
  digitBox: {
    width: 44, height: 56,
    backgroundColor: Colors.surface,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.border, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  digitBoxActive: { borderColor: Colors.primary, borderBottomColor: Colors.primary },
  digit: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },

  error: { color: Colors.error, fontSize: FontSize.sm, fontWeight: '700', textAlign: 'center' },

  padSection: { paddingBottom: Spacing.lg },
  actions: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
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
  deleteKey: { backgroundColor: `${Colors.error}22` },
  keyText: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  deleteText: { color: Colors.error, fontSize: FontSize.lg },
});
