import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function PhoneEntryScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function sendOtp() {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push({ pathname: '/(auth)/otp-verify', params: { phone } });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your number</Text>
      <Text style={styles.subtitle}>We'll send you a one-time code</Text>
      <TextInput
        style={styles.input}
        placeholder="+1 403 555 0000"
        placeholderTextColor="#555"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        autoFocus
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={sendOtp} disabled={loading || phone.length < 10}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Send Code</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#AAAAAA', marginBottom: 32 },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', fontSize: 18, padding: 16, borderRadius: 12, marginBottom: 12 },
  error: { color: '#FF4444', marginBottom: 12, fontSize: 14 },
  button: { backgroundColor: '#FF5C00', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
