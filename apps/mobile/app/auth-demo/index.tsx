import { Button } from "react-native";
import { Logger } from "@repo/utils-core";
import { authClient } from "./auth-client";

export default function SocialSignIn() {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "http://localhost:8081/auth-demo",
    });
  };
  return (
    <Button
      title="Login with Google"
      onPress={() => {
        handleLogin().catch((err) => Logger.instance.error(err));
      }}
    />
  );
}
