import { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

const CODE_LENGTH = 6;

export default function OTPVerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const router = useRouter();
  const { setSession } = useAuthStore();
  const { setPhone } = useOnboardingStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  async function handleVerify() {
    if (code.length < CODE_LENGTH) return;
    setError('');
    setLoading(true);
    const { data, error: supaError } = await supabase.auth.verifyOtp({
      phone: phone ?? '',
      token: code,
      type: 'sms',
    });
    setLoading(false);
    if (supaError || !data.session) {
      setError('Invalid code. Please try again.');
      return;
    }
    setSession(data.session);
    setPhone(phone ?? '');
    router.replace('/(auth)/onboarding/profile-setup');
  }

  const digits = code.split('');

  return (
    <Screen style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter the code</Text>
        <Text style={styles.subtitle}>Sent to {phone}</Text>

        <Pressable style={styles.codeRow} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <View key={i} style={[styles.digitBox, i === digits.length && styles.digitBoxActive]}>
              <Text style={styles.digit}>{digits[i] ?? ''}</Text>
            </View>
          ))}
        </Pressable>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          style={styles.hiddenInput}
          autoFocus
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <View style={styles.actions}>
        <Button label="Verify" onPress={handleVerify} loading={loading} disabled={code.length < CODE_LENGTH} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'space-between', paddingVertical: Spacing.xxl },
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '700' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.md },
  codeRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' },
  digitBox: {
    width: 48, height: 56, borderRadius: Radius.sm,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  digitBoxActive: { borderColor: Colors.primary },
  digit: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '600' },
  hiddenInput: { position: 'absolute', opacity: 0, height: 0 },
  error: { color: Colors.error, fontSize: FontSize.sm, textAlign: 'center' },
  actions: { paddingHorizontal: Spacing.lg },
});
