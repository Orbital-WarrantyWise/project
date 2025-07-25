import { type EmailOtpType } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/helpers/supabase';
import { useEffect, useState } from 'react';

export default function Confirm() {
  const { token_hash, type } = useLocalSearchParams<{ token_hash: string; type: EmailOtpType }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const authConfirm = async () => {
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash,
        });
        if (!error) {
          setSuccess(true);
        }
      }
      setLoading(false);
    };
    authConfirm();
  }, [router, token_hash, type]);

  return loading ? 'Loading...' : success ? 'You have confirmed! Click here to redirect to login page' : 'Error :(';
}
