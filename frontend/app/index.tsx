import { StyleSheet, Text, View, Image, Button } from 'react-native';
import { getSession, clearSession } from '@/helpers/storage';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    getSession('SUPABASE_ACCESS_TOKEN').then(val => {
      setLoggedIn(val !== null);
    });
  }, []);

  const router = useRouter();
  const styleSheet = StyleSheet.create({
    logoLabel: {
      marginBottom: 5,
      fontWeight: 'bold',
    },
    buttonViewWrapper: {
      marginTop: 15,
    },
  });

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

      {loggedIn ? (
        <View>
          <View style={styleSheet.buttonViewWrapper}>
            <Button
              title="Logout"
              onPress={() => {
                clearSession('SUPABASE_ACCESS_TOKEN').then(() => {
                  setLoggedIn(false);
                });
              }}
            />
          </View>

          <View style={styleSheet.buttonViewWrapper}>
            <Button
              title="New Warranty"
              onPress={() => {
                router.navigate('/add_warranty');
              }}
            />
          </View>

          <View style={styleSheet.buttonViewWrapper}>
            <Button
              title="List Warranties"
              onPress={() => {
                router.navigate('/get_warranties');
              }}
            />
          </View>

          <View style={styleSheet.buttonViewWrapper}>
            <Button
              title="Search Warranties"
              onPress={() => {
                router.navigate('/search_warranties');
              }}
            />
          </View>
        </View>
      ) : (
        <View>
          <View style={styleSheet.buttonViewWrapper}>
            <Button
              title="Register"
              onPress={() => {
                router.navigate('/register');
              }}
            />
          </View>

          <View style={styleSheet.buttonViewWrapper}>
            <Button
              title="Login"
              onPress={() => {
                router.navigate('/login');
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}
