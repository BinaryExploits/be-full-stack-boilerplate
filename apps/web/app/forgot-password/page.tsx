"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthClient } from "../lib/auth/auth-client";
import { useI18n } from "../hooks/useI18n";

export default function ForgotPasswordPage() {
  const { LL } = useI18n();
  const authClient = useAuthClient();
  const router = useRouter();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;

  useEffect(() => {
    if (session?.user) {
      router.replace("/");
    }
  }, [session, router]);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authClient) return;

    setLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : "/reset-password";

    await authClient.requestPasswordReset({
      email: email.trim(),
      redirectTo,
    });

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {LL.Auth.forgotPasswordTitle()}
            </h1>
            <p className="text-gray-600">
              {submitted
                ? LL.Auth.checkYourInbox()
                : LL.Auth.forgotPasswordSubtitle()}
            </p>
          </div>

          {submitted ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-blue-600"
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
              </div>
              <p className="text-gray-600 mb-6">
                {LL.Auth.resetLinkSentMessage()}
              </p>
              <Link
                href="/sign-in"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {LL.Auth.backToSignIn()}
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit(e);
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
                  placeholder={LL.Forms.emailPlaceholder()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? LL.Common.sending() : LL.Auth.sendResetLink()}
              </button>
              <p className="text-center text-sm text-gray-600">
                <Link
                  href="/sign-in"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {LL.Auth.backToSignIn()}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
