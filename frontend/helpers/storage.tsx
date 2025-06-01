import { Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';

export async function storeSession(key: string, val: string) { // Necessary since React Web doesn't support SecureStore :(
  if (Platform.OS == "web") {
    window.localStorage.setItem(key, val);
  } else {
    await SecureStore.setItemAsync(key, val);
  }
}

export async function getSession(key: string, val: string) { // Necessary since React Web doesn't support SecureStore :(
  if (Platform.OS == "web") {
    window.localStorage.setItem(key, val);
  } else {
    await SecureStore.setItemAsync(key, val);
  }
}
