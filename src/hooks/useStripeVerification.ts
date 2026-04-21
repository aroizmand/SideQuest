import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export function useStripeVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuthStore();

  async function startVerification() {
    if (!session) return;
    setLoading(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke('create-stripe-verification-session', {
      body: { user_id: session.user.id },
    });
    setLoading(false);
    if (fnError || !data?.url) {
      setError(fnError?.message ?? 'Failed to start verification');
      return;
    }
    // Open Stripe Identity URL in browser (handled by Stripe SDK in production)
  }

  return { startVerification, loading, error };
}
