import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SideQuest</Text>
      <Text style={styles.tagline}>Adventures happening now, near you.</Text>
      <Pressable style={styles.button} onPress={() => router.push('/(auth)/phone-entry')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 40, fontWeight: '800', color: '#FF5C00', marginBottom: 12 },
  tagline: { fontSize: 16, color: '#AAAAAA', textAlign: 'center', marginBottom: 48 },
  button: { backgroundColor: '#FF5C00', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
