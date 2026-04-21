import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function OtpVerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setSession } = useAuthStore();

  async function verifyOtp() {
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    setLoading(false);
    if (error || !data.session) {
      setError(error?.message ?? 'Verification failed');
      return;
    }
    setSession(data.session);
    // New user → onboarding, existing user → app
    const { data: profile } = await supabase.from('dim_user').select('user_id').eq('user_id', data.session.user.id).single();
    if (!profile) {
      router.replace('/(auth)/onboarding/selfie');
    } else {
      router.replace('/(app)/feed');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the code</Text>
      <Text style={styles.subtitle}>Sent to {phone}</Text>
      <TextInput
        style={styles.input}
        placeholder="000000"
        placeholderTextColor="#555"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        autoFocus
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={verifyOtp} disabled={loading || otp.length < 6}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Verify</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#AAAAAA', marginBottom: 32 },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', fontSize: 24, letterSpacing: 8, padding: 16, borderRadius: 12, marginBottom: 12, textAlign: 'center' },
  error: { color: '#FF4444', marginBottom: 12, fontSize: 14 },
  button: { backgroundColor: '#FF5C00', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
