import { StyleSheet, Text, View, Image, Button } from 'react-native';
import { useRouter } from 'expo-router';

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
          <Button title="Register" onPress={() => router.navigate('/register')} />
        </View>

        <View style={styleSheet.buttonViewWrapper}>
          <Button title="Login" onPress={() => router.navigate('/login')} />
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
