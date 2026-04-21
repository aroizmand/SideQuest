import { View, Text, FlatList, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuestManage } from '@/hooks/useQuestManage';

export default function ManageQuestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quest, members, loading, removeParticipant, cancelQuest } = useQuestManage(id);
  const router = useRouter();

  if (loading || !quest) return <View style={styles.center}><ActivityIndicator color="#FF5C00" /></View>;

  function confirmCancel() {
    Alert.alert('Cancel Quest', 'Are you sure? This will notify all participants.', [
      { text: 'No', style: 'cancel' },
      { text: 'Cancel Quest', style: 'destructive', onPress: async () => { await cancelQuest(); router.back(); } },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{quest.title}</Text>
      <Text style={styles.meta}>{members.length} / {quest.max_participants} participants</Text>

      <FlatList
        data={members}
        keyExtractor={m => m.user_id}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Text style={styles.memberName}>{item.first_name}</Text>
            <Pressable onPress={() => removeParticipant(item.user_id)} style={styles.removeButton}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        )}
        style={styles.list}
      />

      <Pressable style={styles.cancelButton} onPress={confirmCancel}>
        <Text style={styles.cancelText}>Cancel Quest</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 24, paddingTop: 60 },
  center: { flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  meta: { color: '#888', fontSize: 14, marginBottom: 24 },
  list: { flex: 1 },
  memberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  memberName: { color: '#FFF', fontSize: 16 },
  removeButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FF4444' },
  removeText: { color: '#FF4444', fontSize: 13 },
  cancelButton: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  cancelText: { color: '#FF4444', fontWeight: '700', fontSize: 16 },
});
