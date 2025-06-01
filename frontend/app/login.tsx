import { StyleSheet, View, Text, TextInput, Button, ActivityIndicator } from "react-native";
import { useState } from 'react';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { storeSession } from '../helpers/storage';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmitButton = async () => {
    if (submitLoading) return; // Just in case
    setSubmitLoading(true);
    const data = {
      email: email,
      password: password
    };
    console.log('Form Data is', data);
    const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_BASE_URL + "/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    console.log('Backend Response is', res.status, json);
    if (json["success"]) {
      let session_details = json["data"]["session"];
      await storeSession("SUPABASE_ACCESS_TOKEN", session_details["access_token"]);
      //await storeSession("SUPABASE_USER_ID", session_details["user"]["id"]);
      showMessage({ type: 'success', message: 'Successful Login!'});
    } else {
      let error_details = json["error"];
      showMessage({ type: 'danger', message: `Failed to Login! [${error_details["code"]}: ${error_details["name"]}]`});
    }
    setSubmitLoading(false);
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
    }
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={styleSheet.textLabel}>Email:</Text>
      <TextInput style={styleSheet.textInput}
        value={email}
        onChangeText={setEmail}
        placeholder="example@email.com"
        placeholderTextColor="#808080"
        inputMode="email"
      />

      <Text style={styleSheet.textLabel}>Password:</Text>
      <TextInput style={styleSheet.textInput}
        value={password}
        onChangeText={setPassword}
        placeholder="•••••••••••••••"
        placeholderTextColor="#808080"
        secureTextEntry={true}
      />

      <View style={styleSheet.submitButtonViewWrapper}>
        {
          submitLoading ?
          <ActivityIndicator size="small" /> :
          <Button title="Login" onPress={handleSubmitButton} />
        }
      </View>

      <FlashMessage position="top" />
    </View>
  );
}
