import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Colors, FontSize, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.logo}>SideQuest</Text>
        <Text style={styles.tagline}>Real-world adventures, together.</Text>
      </View>
      <View style={styles.actions}>
        <Button label="Get Started" onPress={() => router.push('/(auth)/phone-entry')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'space-between', paddingVertical: Spacing.xxl },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  logo: { color: Colors.text, fontSize: FontSize.xxxl, fontWeight: '700' },
  tagline: { color: Colors.textSecondary, fontSize: FontSize.md },
  actions: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
});
