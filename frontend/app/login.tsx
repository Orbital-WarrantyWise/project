import { StyleSheet, View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { useRouter } from 'expo-router';
import { supabase } from '@/helpers/supabase';

export default function Login() {
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
    const res = await supabase.auth.signInWithPassword(data);
    if (res.error) {
      showMessage({
        type: 'danger',
        message: `Failed to Login! [${res.error.name}: ${res.error.message}]`,
      });
      setSubmitLoading(false);
    } else {
      showMessage({ type: 'success', message: 'Successful Login!' });
      setSubmitLoading(false);
      router.replace('/main');
    }
  };

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
        {submitLoading ? <ActivityIndicator size="small" /> : <Button title="Login" onPress={handleSubmitButton} />}
      </View>

      <FlashMessage position="top" />
    </View>
  );
}

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
