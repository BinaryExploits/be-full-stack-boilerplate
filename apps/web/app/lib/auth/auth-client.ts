import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { getFrontendBaseUrl } from "../utils/url";

export const authClient = createAuthClient({
  baseURL: getFrontendBaseUrl(),
  plugins: [emailOTPClient()],
});
