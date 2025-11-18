import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { getFrontendUrl } from "../utils/url";

export const authClient = createAuthClient({
  baseURL: getFrontendUrl(),
  plugins: [emailOTPClient()],
});
