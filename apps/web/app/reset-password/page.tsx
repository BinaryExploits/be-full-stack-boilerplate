"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuthClient } from "../lib/auth/auth-client";
import { useI18n } from "../hooks/useI18n";
import type { TranslationFunctions } from "../../i18n/i18n-types";

function validatePassword(
  value: string,
  E: TranslationFunctions["Errors"],
): string | null {
  if (!value) return E.passwordRequired();
  if (value.length < 8) return E.passwordMinLength();
  if (value.length > 128) return E.passwordMaxLength();
  if (!/[A-Z]/.test(value)) return E.passwordUppercase();
  if (!/[a-z]/.test(value)) return E.passwordLowercase();
  if (!/[0-9]/.test(value)) return E.passwordNumber();
  if (!/[^A-Za-z0-9]/.test(value)) return E.passwordSpecialChar();
  return null;
}

function ResetPasswordContent() {
  const { LL } = useI18n();
  const authClient = useAuthClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [tokenError, setTokenError] = useState(false);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    if (errorParam) {
      setTokenError(true);
    }
  }, [errorParam]);

  if (tokenError || !token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-red-600 dark:text-red-400"
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
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {LL.Auth.invalidOrExpiredLink()}
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mb-6">
            {LL.Auth.invalidOrExpiredLinkMessage()}
          </p>
          <Link
            href="/forgot-password"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {LL.Auth.requestNewLink()}
          </Link>
        </div>
      </div>
    );
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authClient) return;

    const errors: Record<string, string> = {};

    const pwErr = validatePassword(newPassword, LL.Errors);
    if (pwErr) errors.newPassword = pwErr;

    if (!confirmPassword) {
      errors.confirmPassword = LL.Errors.passwordRequired();
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = LL.Errors.passwordsDoNotMatch();
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setError(null);

    const { error: err } = await authClient.resetPassword({
      newPassword,
      token,
    });

    setLoading(false);

    if (err) {
      if (
        err.message?.toLowerCase().includes("invalid") ||
        err.message?.toLowerCase().includes("expired")
      ) {
        setTokenError(true);
      } else {
        setError(err.message ?? LL.Errors.failedResetPassword());
      }
      return;
    }

    router.push(
      "/sign-in?success=" + encodeURIComponent(LL.Auth.passwordSetSuccess()),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {LL.Auth.setYourPassword()}
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              {LL.Auth.setPasswordSubtitle()}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0"
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
                <span className="text-red-800 dark:text-red-400 text-sm">
                  {error}
                </span>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleReset(e);
            }}
            className="space-y-4"
          >
            <div suppressHydrationWarning>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
              >
                {LL.Settings.newPasswordLabel()}
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (fieldErrors.newPassword) clearFieldError("newPassword");
                }}
                required
                maxLength={128}
                placeholder={LL.Forms.passwordPlaceholder()}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 ${fieldErrors.newPassword ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-slate-600"}`}
              />
              {fieldErrors.newPassword ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.newPassword}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
                  {LL.Auth.passwordMinChars()}
                </p>
              )}
            </div>
            <div suppressHydrationWarning>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
              >
                {LL.Forms.confirmPassword()}
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword)
                    clearFieldError("confirmPassword");
                }}
                required
                maxLength={128}
                placeholder={LL.Forms.passwordPlaceholder()}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 ${fieldErrors.confirmPassword ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-slate-600"}`}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? LL.Auth.settingPassword() : LL.Auth.setPassword()}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-b-blue-400 border-transparent" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
