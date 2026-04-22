import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { useState } from 'react';

export default function TOSAcceptScreen() {
  const router = useRouter();
  const { setHasProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    // dim_user has no tos_accepted_at column — profile existence is sufficient
    setHasProfile(true);
    setLoading(false);
    router.replace('/(app)/feed');
  }

  return (
    <Screen style={styles.screen}>
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
  content: { padding: Spacing.lg, gap: Spacing.lg },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '700' },
  body: { color: Colors.textSecondary, fontSize: FontSize.md, lineHeight: 24 },
  actions: { padding: Spacing.lg },
});
