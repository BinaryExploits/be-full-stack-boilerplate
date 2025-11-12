import { Logger } from "@repo/utils-core";

export function useAuthLogic({
  authClient,
  callbackURL,
}: {
  authClient: ReturnType<typeof import("better-auth/react").createAuthClient>;
  callbackURL: string;
}) {
  const { data: session, isPending } = authClient.useSession();

  const signInWithGoogle = async () => {
    try {
      const data = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
      Logger.instance.info("Sign in With Google", data);
      return data;
    } catch (error) {
      Logger.instance.error(error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      Logger.instance.info("Signed out successfully");
    } catch (error) {
      Logger.instance.error(error);
      throw error;
    }
  };

  return {
    session,
    isPending,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!session,
  };
}
