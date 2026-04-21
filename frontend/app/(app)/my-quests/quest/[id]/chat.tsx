import { useLocalSearchParams } from 'expo-router';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Channel, MessageList, MessageInput, Chat } from 'stream-chat-react-native';
import { useStreamChannel } from '@/hooks/useStreamChannel';
import { streamClient } from '@/lib/stream';

export default function QuestChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { channel, loading } = useStreamChannel(id);

  if (loading || !channel) {
    return <View style={styles.center}><ActivityIndicator color="#FF5C00" /></View>;
  }

  return (
    <Chat client={streamClient}>
      <Channel channel={channel}>
        <View style={styles.container}>
          <MessageList />
          <MessageInput />
        </View>
      </Channel>
    </Chat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  center: { flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' },
});
