import { StyleSheet, Text, View, Image, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/helpers/supabase';

export default function Index() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={styleSheet.logoLabel}>WarrantyWise</Text>
      <Image source={require('@/assets/images/warrantywise-logo.png')} />

      <View>
        <View style={styleSheet.buttonViewWrapper}>
          <Button title="Logout" onPress={() => supabase.auth.signOut()} />
        </View>

        <View style={styleSheet.buttonViewWrapper}>
          <Button title="New Warranty" onPress={() => router.navigate('/main/warranties/new')} />
        </View>

        <View style={styleSheet.buttonViewWrapper}>
          <Button title="List Warranties" onPress={() => router.navigate('/main/warranties/list')} />
        </View>

        <View style={styleSheet.buttonViewWrapper}>
          <Button title="Search Warranties" onPress={() => router.navigate('/main/warranties/search')} />
        </View>

        <View style={styleSheet.buttonViewWrapper}>
          <Button title="List Organisations" onPress={() => router.navigate('/main/organisations/list')} />
        </View>
      </View>
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
