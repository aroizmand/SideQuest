import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/stores/authStore';
import { Colors, FontSize, Spacing } from '@/constants/theme';

export default function TOSAcceptScreen() {
  const router = useRouter();
  const { setHasProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    setHasProfile(true);
    setLoading(false);
    router.replace('/(app)/feed');
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.body}>
          By using SideQuest you agree to meet in safe, public places and treat fellow adventurers with respect.
          {'\n\n'}
          SideQuest is not responsible for any activities that take place during quests. Always exercise good judgment and stay safe.
          {'\n\n'}
          We reserve the right to remove content or accounts that violate our community guidelines.
        </Text>
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Accept & Continue" onPress={handleAccept} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'space-between' },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  backBtn: { padding: Spacing.sm },
  backText: { color: Colors.text, fontSize: FontSize.xl },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '700' },
  body: { color: Colors.textSecondary, fontSize: FontSize.md, lineHeight: 24 },
  actions: { padding: Spacing.lg },
});
