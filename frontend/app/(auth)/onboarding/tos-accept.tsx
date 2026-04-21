import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { createUserProfile } from '@/lib/profile';

export default function TosAcceptScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { session } = useAuthStore();
  const { photoUri, firstName, age, gender, reset } = useOnboardingStore();

  async function accept() {
    if (!session || !photoUri || !firstName || !age || !gender) return;
    setLoading(true);
    setError(null);
    const { error } = await createUserProfile({ session, photoUri, firstName, age, gender });
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    reset();
    router.replace('/(app)/feed');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Before you quest</Text>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.tosText}>
          {'By joining SideQuest you agree to:\n\n' +
            '• Show up. If you join a quest, commit to it.\n\n' +
            '• Be yourself. Your real face and first name are always visible.\n\n' +
            '• Keep it adventurous. No passive meetups — only real activities.\n\n' +
            '• Stay safe. Report anything that feels wrong.\n\n' +
            '• Inactive accounts (90+ days) will be deleted. We will warn you first.\n\n' +
            '• SideQuest is not liable for injuries or incidents during activities. Participate at your own risk.\n\n' +
            'Your data is handled under PIPEDA (Canada). We store only what we need.\n\n' +
            'Full Terms of Service and Privacy Policy available at sidequest.app/legal'}
        </Text>
      </ScrollView>
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={accept} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>I Agree — Let's Go</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFF', marginBottom: 20 },
  scroll: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, marginBottom: 24 },
  tosText: { color: '#CCC', fontSize: 14, lineHeight: 22 },
  error: { color: '#FF4444', marginBottom: 12, fontSize: 14 },
  button: { backgroundColor: '#FF5C00', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
