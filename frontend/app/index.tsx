import { StyleSheet, Text, View, Image, Button } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { getSession, clearSession } from '../helpers/storage';
import { useEffect, useState } from "react";

export default function Index() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  
  useEffect(() => {
    getSession('SUPABASE_ACCESS_TOKEN').then(val => {
      setLoggedIn(val != null);
    })
  }, [])

  const navigation = useNavigation<any>();
  const styleSheet = StyleSheet.create({
    logoLabel: {
      marginBottom: 5,
      fontWeight: 'bold'
    },
    buttonViewWrapper: {
      marginTop: 15,
    },
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={styleSheet.logoLabel}>WarrantyWise Main Menu</Text>
      <Image source={require('../assets/images/warrantywise-logo.png')} />

      {
        loggedIn
        ?
        <View>
          <View style={styleSheet.buttonViewWrapper}>
            <Button title="Logout" onPress={() => {
              clearSession('SUPABASE_ACCESS_TOKEN').then(() => {
                setLoggedIn(false);
              });
            }}/>
          </View>

          <View style={styleSheet.buttonViewWrapper}>
            <Button title="New Warranty" onPress={() => {
              navigation.navigate('add_warranty');
            }}/>
          </View>

          <View style={styleSheet.buttonViewWrapper}>
            <Button title="List Warranties" onPress={() => {
              navigation.navigate('get_warranties');
            }}/>
          </View>
        </View>
        :
        <View>
          <View style={styleSheet.buttonViewWrapper}>
            <Button title="Register" onPress={() => {
              navigation.navigate('register');
            }}/>
          </View>

          <View style={styleSheet.buttonViewWrapper}>
            <Button title="Login" onPress={() => {
              navigation.navigate('login');
            }}/>
          </View>
        </View>
      }
    </View>
  );
}
