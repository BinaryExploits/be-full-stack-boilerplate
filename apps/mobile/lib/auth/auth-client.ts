import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { getApiUrl } from "@/lib/utils/url";
import { AppConstants } from "@/constants/app";

export const authClient = createAuthClient({
  baseURL: getApiUrl(),
  plugins: [
    expoClient({
      scheme: AppConstants.scheme,
      storagePrefix: AppConstants.scheme,
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
});
