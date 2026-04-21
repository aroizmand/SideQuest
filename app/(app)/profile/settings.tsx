import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';

export default function SettingsScreen() {
  const router = useRouter();
  const { digestEnabled, setDigestEnabled } = useNotificationSettings();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></Pressable>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.section}>Notifications</Text>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Daily quest digest</Text>
        <Switch value={digestEnabled} onValueChange={setDigestEnabled} trackColor={{ true: '#FF5C00' }} />
      </View>

      <Text style={styles.section}>Account</Text>
      <Pressable style={styles.menuItem} onPress={() => router.push('/(app)/profile/verify-id')}>
        <Text style={styles.menuItemText}>ID Verification</Text>
      </Pressable>
      <Pressable style={styles.menuItem}>
        <Text style={[styles.menuItemText, { color: '#FF4444' }]}>Delete Account</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 24, paddingTop: 60 },
  back: { marginBottom: 24 },
  backText: { color: '#FF5C00', fontSize: 15 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 32 },
  section: { fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  rowLabel: { color: '#FFF', fontSize: 16 },
  menuItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  menuItemText: { color: '#FFF', fontSize: 16 },
});
