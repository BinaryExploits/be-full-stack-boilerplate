import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Use platform-specific URLs for Android emulator compatibility
const getBaseURL = () => {
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_AUTH_URL_ANDROID!;
  }
  return process.env.EXPO_PUBLIC_AUTH_URL!;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    expoClient({
      scheme: "mobile",
      storagePrefix: "mobile",
      storage: SecureStore,
    }),
  ],
});
