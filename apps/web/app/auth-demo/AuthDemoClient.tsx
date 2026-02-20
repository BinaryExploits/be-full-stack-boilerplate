"use client";

import { Logger } from "@repo/utils-core";
import Link from "next/link";
import { useState } from "react";
import {
  authClient as authClientDefault,
  useAuthClient,
} from "../lib/auth/auth-client";
import { useI18n } from "../hooks/useI18n";
import { AuthDemoLoadingShell } from "./AuthDemoLoadingShell";

type AuthStep =
  | "choose"
  | "email"
  | "otp"
  | "emailPasswordSignUp"
  | "emailPasswordSignIn";

/** Build callback URL from current origin and pathname (client-only; use in event handlers only). */
function getCallbackUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}`;
}

/** Auth client with email OTP plugin (better-auth plugin types not fully inferred). */
type AuthClientWithEmailOtp = typeof authClientDefault & {
  emailOtp: {
    sendVerificationOtp: (opts: {
      email: string;
      type: string;
    }) => Promise<{ data?: boolean; error?: unknown }>;
  };
  signIn: typeof authClientDefault.signIn & {
    emailOtp: (opts: { email: string; otp: string }) => Promise<{
      data?: unknown;
      error?: unknown;
    }>;
  };
};

export default function AuthDemoClient() {
  const { LL } = useI18n();
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;
  const isPending = sessionResult?.isPending ?? true;
  const refetchSession = sessionResult?.refetch ?? (async () => {});
  const [authStep, setAuthStep] = useState<AuthStep>("choose");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authClient || isPending) {
    return <AuthDemoLoadingShell />;
  }

  const signInWithGoogle = async () => {
    const signInResponse = await authClient.signIn.social({
      provider: "google",
      callbackURL: getCallbackUrl(),
    });

    if (signInResponse.error) {
      Logger.instance.critical("Error while Signing in", signInResponse.error);
      setError(LL.Errors.failedSignInGoogle());
    }
  };

  const signOut = async () => {
    const signOutResponse = await authClient.signOut();
    if (signOutResponse.error) {
      Logger.instance.critical(
        "Error while signing out",
        signOutResponse.error.message,
      );
    } else {
      resetAuthFlow();
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError(null);

    const client = authClient as AuthClientWithEmailOtp;
    const result = (await client.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    })) as unknown as { data?: boolean; error?: unknown };
    const success = result.data;
    const sendErr = result.error;

    setLoading(false);

    if (sendErr) {
      Logger.instance.critical(sendErr as Error);
      setError(LL.Errors.failedSendOtp());
      return;
    }

    if (!success) {
      setError(LL.Errors.unableToSendOtp());
      return;
    }

    setAuthStep("otp");
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError(null);

    const client = authClient as AuthClientWithEmailOtp;
    const result = (await client.signIn.emailOtp({
      email,
      otp,
    })) as unknown as { data?: unknown; error?: unknown };
    const data = result.data;
    const verifyErr = result.error;

    setLoading(false);

    if (verifyErr) {
      Logger.instance.critical(verifyErr as Error);
      setError(LL.Errors.invalidOtp());
      return;
    }

    if (!data) {
      setError(LL.Errors.unableToVerifyOtp());
    }
  };

  const resetAuthFlow = () => {
    setAuthStep("choose");
    setEmail("");
    setOtp("");
    setName("");
    setPassword("");
    setError(null);
  };

  const handleSignUpEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: err } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      callbackURL: getCallbackUrl() || "/auth-demo",
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? LL.Errors.signUpFailed());
      return;
    }
    if (!data) setError(LL.Errors.signUpFailed());
    else {
      await refetchSession();
    }
  };

  const handleSignInEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: err } = await authClient.signIn.email({
      email: email.trim(),
      password,
      callbackURL: getCallbackUrl() || "/auth-demo",
    });
    setLoading(false);
    if (err) {
      setError(LL.Errors.signInFailed());
      return;
    }
    if (!data) setError(LL.Errors.signInFailed());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {LL.Common.backToHome()}
        </Link>

        <div className="w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {LL.Auth.betterAuthDemo()}
            </h1>
            <p className="text-gray-600">
              {session ? LL.Auth.welcomeBack() : LL.Auth.signInToContinue()}
            </p>
          </div>

          {session ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-green-800 font-medium">
                    {LL.Auth.youAreSignedIn()}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {LL.Auth.userInformation()}
                </h2>
                <div className="space-y-3">
                  {session.user.image && (
                    <div className="flex justify-center">
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-20 h-20 rounded-full border-2 border-gray-200"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">{LL.Forms.name()}</p>
                    <p className="text-gray-900 font-medium">
                      {session.user.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{LL.Forms.email()}</p>
                    <p className="text-gray-900 font-medium">
                      {session.user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="text-gray-900 font-mono text-sm">
                      {session.user.id}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  signOut().catch((err: Error) => {
                    Logger.instance.critical(err);
                  });
                }}
                className="w-full px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                {LL.Auth.signOutButton()}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {authStep === "choose" && (
                <>
                  <p className="text-xs text-gray-500 text-center">
                    By signing in, you agree to our privacy policy and consent
                    to the processing of your personal data. You can withdraw
                    consent at any time from your profile settings.
                  </p>

                  <button
                    onClick={() => {
                      signInWithGoogle().catch((err: Error) => {
                        Logger.instance.critical(err);
                      });
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {LL.Auth.signInWithGoogle()}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        {LL.Common.or()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setAuthStep("email")}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {LL.Auth.signInWithEmailOtp()}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        {LL.Auth.orEmailPassword()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setAuthStep("emailPasswordSignUp");
                      setError(null);
                      setName("");
                      setEmail("");
                      setPassword("");
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {LL.Auth.signUpWithEmailPassword()}
                  </button>

                  <button
                    onClick={() => {
                      setAuthStep("emailPasswordSignIn");
                      setError(null);
                      setEmail("");
                      setPassword("");
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {LL.Auth.signInWithEmailPassword()}
                  </button>
                </>
              )}

              {authStep === "emailPasswordSignUp" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSignUpEmailPassword(e);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="signup-name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {LL.Forms.name()}
                    </label>
                    <input
                      type="text"
                      id="signup-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder={LL.Forms.namePlaceholder()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="signup-email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {LL.Forms.email()}
                    </label>
                    <input
                      type="email"
                      id="signup-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={LL.Forms.emailPlaceholder()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {LL.Forms.passwordMinChars()}
                    </label>
                    <input
                      type="password"
                      id="signup-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      maxLength={128}
                      placeholder={LL.Forms.passwordPlaceholder()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? LL.Auth.creatingAccount() : LL.Auth.signUp()}
                  </button>
                  <button
                    type="button"
                    onClick={resetAuthFlow}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {LL.Common.back()}
                  </button>
                </form>
              )}

              {authStep === "emailPasswordSignIn" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSignInEmailPassword(e);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="signin-email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {LL.Forms.email()}
                    </label>
                    <input
                      type="email"
                      id="signin-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={LL.Forms.emailPlaceholder()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="signin-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {LL.Forms.password()}
                    </label>
                    <input
                      type="password"
                      id="signin-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder={LL.Forms.passwordPlaceholder()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? LL.Auth.signingIn() : LL.Auth.signIn()}
                  </button>
                  <button
                    type="button"
                    onClick={resetAuthFlow}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {LL.Common.back()}
                  </button>
                </form>
              )}

              {authStep === "email" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSendOTP();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {LL.Forms.emailAddress()}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={LL.Forms.enterYourEmail()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? LL.Common.sending() : LL.Auth.sendOtp()}
                  </button>

                  <button
                    type="button"
                    onClick={resetAuthFlow}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {LL.Common.back()}
                  </button>
                </form>
              )}

              {authStep === "otp" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleVerifyOTP();
                  }}
                  className="space-y-4"
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      {LL.Auth.otpSentTo({ email })}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {LL.Forms.verificationCode()}
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder={LL.Forms.verificationCodePlaceholder()}
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? LL.Auth.verifying() : LL.Auth.verifyOtp()}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep("email");
                      setOtp("");
                      setError(null);
                    }}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {LL.Auth.changeEmail()}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
