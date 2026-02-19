"use client";

import { Logger } from "@repo/utils-core";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  authClient as authClientDefault,
  useAuthClient,
} from "../lib/auth/auth-client";

type AuthView = "choose" | "email-otp" | "otp-verify" | "email-password";

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

function SignInContent() {
  const authClient = useAuthClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<AuthView>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [showUnverifiedError, setShowUnverifiedError] = useState(false);

  const successMessage = searchParams.get("success");

  function getCallbackUrl(): string {
    if (typeof window === "undefined") return "/";
    return `${window.location.origin}/`;
  }

  const signInWithGoogle = async () => {
    if (!authClient) return;
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: getCallbackUrl(),
    });
    if (result.error) {
      Logger.instance.critical("Error while signing in", result.error);
      setError("Failed to sign in with Google");
    }
  };

  const handleSendOTP = async () => {
    if (!authClient) return;
    setLoading(true);
    setError(null);

    const client = authClient as AuthClientWithEmailOtp;
    const result = (await client.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: "sign-in",
    })) as unknown as { data?: boolean; error?: unknown };

    setLoading(false);
    if (result.error) {
      setError("Failed to send OTP. Please try again.");
      return;
    }
    if (!result.data) {
      setError("Unable to send OTP");
      return;
    }
    setView("otp-verify");
  };

  const handleVerifyOTP = async () => {
    if (!authClient) return;
    setLoading(true);
    setError(null);

    const client = authClient as AuthClientWithEmailOtp;
    const result = (await client.signIn.emailOtp({
      email: email.trim(),
      otp,
    })) as unknown as { data?: unknown; error?: unknown };

    setLoading(false);
    if (result.error) {
      setError("Invalid OTP. Please try again.");
      return;
    }
    if (!result.data) {
      setError("Unable to verify OTP");
      return;
    }
    router.push("/");
  };

  const handleSignInEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authClient) return;
    setLoading(true);
    setError(null);
    setShowUnverifiedError(false);

    let handledByOnError = false;

    const { error: err } = await authClient.signIn.email(
      {
        email: email.trim(),
        password,
        callbackURL: getCallbackUrl(),
      },
      {
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            handledByOnError = true;
            setShowUnverifiedError(true);
            setError("Please verify your email address before signing in.");
          }
        },
      },
    );

    setLoading(false);

    if (err && !handledByOnError) {
      const msg = err.message?.toLowerCase() ?? "";
      if (
        msg.includes("no credential") ||
        msg.includes("invalid credentials") ||
        msg.includes("no password")
      ) {
        setError(
          "This account was created with Google or OTP. Use 'Forgot Password' below to set a password.",
        );
      } else {
        setError("Invalid email or password.");
      }
    }
  };

  const handleResendVerification = async () => {
    if (!authClient) return;
    setResendingVerification(true);
    await authClient.sendVerificationEmail({
      email: email.trim(),
      callbackURL: `${typeof window !== "undefined" ? window.location.origin : ""}/verify-email`,
    });
    setResendingVerification(false);
    setError("Verification email sent! Check your inbox.");
    setShowUnverifiedError(false);
  };

  const resetView = () => {
    setView("choose");
    setEmail("");
    setPassword("");
    setOtp("");
    setError(null);
    setShowUnverifiedError(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
            <p className="text-gray-600">
              Choose your preferred sign-in method
            </p>
          </div>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0"
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
                <span className="text-green-800 text-sm">{successMessage}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
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
                <div className="flex-1">
                  <span className="text-red-800 text-sm">{error}</span>
                  {showUnverifiedError && (
                    <button
                      onClick={() => void handleResendVerification()}
                      disabled={resendingVerification}
                      className="mt-2 block text-sm font-medium text-red-700 hover:text-red-800 underline disabled:opacity-50"
                    >
                      {resendingVerification
                        ? "Sending..."
                        : "Resend verification email"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === "choose" && (
            <div className="space-y-4">
              <button
                onClick={() => void signInWithGoogle()}
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
                Sign in with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setView("email-otp");
                  setError(null);
                }}
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
                Sign in with Email OTP
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or with Email &amp; Password
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setView("email-password");
                  setError(null);
                }}
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Sign in with Email &amp; Password
              </button>
            </div>
          )}

          {view === "email-otp" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendOTP();
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="otp-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="otp-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
              <button
                type="button"
                onClick={resetView}
                className="w-full px-4 py-3 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            </form>
          )}

          {view === "otp-verify" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleVerifyOTP();
              }}
              className="space-y-4"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  We sent a verification code to{" "}
                  <span className="font-medium">{email}</span>
                </p>
              </div>
              <div>
                <label
                  htmlFor="otp-code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setView("email-otp");
                  setOtp("");
                  setError(null);
                }}
                className="w-full px-4 py-3 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Change Email
              </button>
            </form>
          )}

          {view === "email-password" && (
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
                  Email
                </label>
                <input
                  type="email"
                  id="signin-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div suppressHydrationWarning>
                <label
                  htmlFor="signin-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="signin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="mt-1 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <button
                type="button"
                onClick={resetView}
                className="w-full px-4 py-3 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-b-blue-400 border-transparent" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
