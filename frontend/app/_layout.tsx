import { supabase } from '@/helpers/supabase';
import { router, Stack } from 'expo-router';
import { useEffect } from 'react';

export default function Layout() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/main');
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/main');
      }
    });
  }, []);

  return <Stack />;
}
