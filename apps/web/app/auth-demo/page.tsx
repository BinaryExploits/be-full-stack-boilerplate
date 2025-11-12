"use client";

import { createAuthClient } from "better-auth/react";
import { Logger } from "@repo/utils-core";

const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
});

const signInWithGoogle = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
    callbackURL: "/auth-demo",
  });

  Logger.instance.info("Sign in With Google", data);
};

export default function AuthDemo() {
  return <button onClick={signInWithGoogle}> Sign In With Google </button>;
}
