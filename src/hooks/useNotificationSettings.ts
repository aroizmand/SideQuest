import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const KEY = 'notif_digest_enabled';

export function useNotificationSettings() {
  const [digestEnabled, setDigestEnabledState] = useState(true);

  async function setDigestEnabled(value: boolean) {
    setDigestEnabledState(value);
    await SecureStore.setItemAsync(KEY, JSON.stringify(value));
  }

  return { digestEnabled, setDigestEnabled };
}
