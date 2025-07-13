import { StyleSheet, Text, View, Image, Button } from 'react-native';
import { getSession, clearSession } from '@/helpers/storage';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';

export default function Index() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    getSession('SUPABASE_ACCESS_TOKEN').then(token => {
      if (token === null) return;

      let loggedIn = false;

      try {
        const decoded = jwtDecode(token);
        console.log(decoded);
        loggedIn = decoded.exp !== undefined && decoded.exp > Math.round(Date.now() / 1000);
      } catch {
        console.warn('Error decoding JWT');
      }

      if (loggedIn) {
        setLoggedIn(true);
      } else {
        // Remove erroneous or expired JWT
        clearSession('SUPABASE_ACCESS_TOKEN');
      }
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
