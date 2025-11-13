import { createAuthClient } from "better-auth/react";
import { getFrontendBaseUrl } from "../utils/url";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: getFrontendBaseUrl(),
  },
);
