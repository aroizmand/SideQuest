import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';

export function useBlockReport(targetUserId: string) {
  const { session } = useAuthStore();
  const router = useRouter();

  async function block() {
    if (!session) return;
    await supabase.from('blocks').insert({ blocker_id: session.user.id, blocked_id: targetUserId });
    Alert.alert('Blocked', 'This user will no longer appear in your feed.');
    router.back();
  }

  function report() {
    Alert.alert('Report User', 'What is the issue?', [
      { text: 'Fake identity',        onPress: () => submitReport('fake_identity') },
      { text: 'Inappropriate content',onPress: () => submitReport('inappropriate_content') },
      { text: 'Unsafe behavior',      onPress: () => submitReport('unsafe_behavior') },
      { text: 'Spam',                 onPress: () => submitReport('spam') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function submitReport(category: string) {
    if (!session) return;
    await supabase.from('reports').insert({ reporter_id: session.user.id, reported_user_id: targetUserId, category });
    Alert.alert('Report submitted', 'Our team will review it shortly.');
  }

  return { block, report };
}
