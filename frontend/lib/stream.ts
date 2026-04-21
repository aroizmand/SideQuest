import { StreamChat } from 'stream-chat';

const apiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

export const streamClient = StreamChat.getInstance(apiKey);

export async function connectStreamUser(userId: string, token: string, name: string, imageUrl: string) {
  if (streamClient.userID) return;
  await streamClient.connectUser({ id: userId, name, image: imageUrl }, token);
}

export async function disconnectStreamUser() {
  if (!streamClient.userID) return;
  await streamClient.disconnectUser();
}

export async function getOrCreateQuestChannel(questId: string, memberIds: string[]) {
  const channel = streamClient.channel('messaging', `quest_${questId}`, {
    members: memberIds,
  });
  await channel.create();
  return channel;
}
