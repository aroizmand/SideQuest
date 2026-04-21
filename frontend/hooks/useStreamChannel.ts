import { useState, useEffect } from 'react';
import { Channel as StreamChannel } from 'stream-chat';
import { streamClient } from '@/lib/stream';

export function useStreamChannel(questId: string) {
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ch = streamClient.channel('messaging', `quest_${questId}`);
    ch.watch().then(() => { setChannel(ch); setLoading(false); });
    return () => { ch.stopWatching(); };
  }, [questId]);

  return { channel, loading };
}
