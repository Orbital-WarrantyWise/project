import { StyleSheet, View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { useRouter } from 'expo-router';

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmitButton = async () => {
    if (submitLoading) return; // Just in case
    setSubmitLoading(true);
    const data = {
      email: email,
      password: password,
    };
    console.log('Form Data is', data);
    const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_BASE_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    console.log('Backend Response is', res.status, json);
    if (json['success']) {
      showMessage({
        type: 'success',
        message: 'Successfully Registered Account!',
      });
      router.replace('/login');
      setSubmitLoading(false);
    } else {
      let error_details = json['error'];
      showMessage({
        type: 'danger',
        message: `Failed to Register Account! [${error_details['code']}: ${error_details['name']}]`,
      });
      setSubmitLoading(false);
    }
  };

  const styleSheet = StyleSheet.create({
    textLabel: {
      marginBottom: 5,
    },
    textInput: {
      marginBottom: 15,
      borderWidth: 1,
    },
    submitButtonViewWrapper: {
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
      <Text style={styleSheet.textLabel}>Email:</Text>
      <TextInput
        style={styleSheet.textInput}
        value={email}
        onChangeText={setEmail}
        placeholder="example@email.com"
        placeholderTextColor="#808080"
        inputMode="email"
      />

      <Text style={styleSheet.textLabel}>Password:</Text>
      <TextInput
        style={styleSheet.textInput}
        value={password}
        onChangeText={setPassword}
        placeholder="•••••••••••••••"
        placeholderTextColor="#808080"
        secureTextEntry={true}
      />

      <View style={styleSheet.submitButtonViewWrapper}>
        {submitLoading ? <ActivityIndicator size="small" /> : <Button title="Register" onPress={handleSubmitButton} />}
      </View>

      <FlashMessage position="top" />
    </View>
  );
}
