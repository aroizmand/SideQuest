import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useStripeVerification } from '@/hooks/useStripeVerification';

export default function VerifyIdScreen() {
  const { startVerification, loading, error } = useStripeVerification();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></Pressable>
      <Text style={styles.title}>Get Verified</Text>
      <Text style={styles.body}>
        Verify your government ID to earn a Verified badge on your profile. This unlocks age and gender-restricted quests and builds trust with other adventurers.
        {'\n\n'}Powered by Stripe Identity. Your ID is verified by Stripe — SideQuest does not store your document.
        {'\n\n'}Cost: $1.50 (one-time).
      </Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={startVerification} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Start Verification</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 24, paddingTop: 60 },
  back: { marginBottom: 24 },
  backText: { color: '#FF5C00', fontSize: 15 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 16 },
  body: { color: '#AAA', fontSize: 15, lineHeight: 24, marginBottom: 32 },
  error: { color: '#FF4444', marginBottom: 16, fontSize: 14 },
  button: { backgroundColor: '#FF5C00', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
