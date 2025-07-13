import { StyleSheet, Text, View, Image, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/helpers/supabase';
import type { Session } from '@supabase/supabase-js';

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={styleSheet.logoLabel}>WarrantyWise Main Menu</Text>
      <Image source={require('../assets/images/warrantywise-logo.png')} />

      {session ? (
        <View>
          <View style={styleSheet.buttonViewWrapper}>
            <Button title="Logout" onPress={() => supabase.auth.signOut()} />
          </View>

          <View style={styleSheet.buttonViewWrapper}>
            <Button title="New Warranty" onPress={() => router.navigate('/add_warranty')} />
          </View>

          <View style={styleSheet.buttonViewWrapper}>
            <Button title="List Warranties" onPress={() => router.navigate('/get_warranties')} />
          </View>

          <View style={styleSheet.buttonViewWrapper}>
            <Button title="Search Warranties" onPress={() => router.navigate('/search_warranties')} />
          </View>
        </View>
      ) : (
        <View>
          <View style={styleSheet.buttonViewWrapper}>
            <Button title="Register" onPress={() => router.navigate('/register')} />
          </View>

          <View style={styleSheet.buttonViewWrapper}>
            <Button title="Login" onPress={() => router.navigate('/login')} />
          </View>
        </View>
      )}
    </View>
  );
}

const styleSheet = StyleSheet.create({
  logoLabel: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  buttonViewWrapper: {
    marginTop: 15,
  },
});
