"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuthClient } from "../lib/auth/auth-client";

interface AccountInfo {
  id: string;
  providerId: string;
  accountId: string;
}

export default function ProfilePage() {
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;
  const user = session?.user;

  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [setPasswordSent, setSetPasswordSent] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);

  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if (!authClient) return;
    setLoadingAccounts(true);
    try {
      const result = await authClient.listAccounts();
      if (result.data) {
        setAccounts(result.data as unknown as AccountInfo[]);
      }
    } catch {
      // accounts may not be available
    }
    setLoadingAccounts(false);
  }, [authClient]);

  useEffect(() => {
    if (authClient && user) {
      void fetchAccounts();
    }
  }, [authClient, user, fetchAccounts]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-b-blue-400 border-transparent" />
      </div>
    );
  }

  const hasGoogle = accounts.some((a) => a.providerId === "google");
  const hasCredential = accounts.some((a) => a.providerId === "credential");

  const handleConnectGoogle = () => {
    if (!authClient) return;
    void authClient.linkSocial({
      provider: "google",
      callbackURL:
        typeof window !== "undefined"
          ? `${window.location.origin}/profile`
          : "/profile",
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authClient) return;

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: false,
    });

    setPasswordLoading(false);

    if (error) {
      setPasswordMessage({
        type: "error",
        text: error.message ?? "Failed to change password.",
      });
      return;
    }

    setPasswordMessage({
      type: "success",
      text: "Password changed successfully.",
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangingPassword(false);
  };

  const handleSetPassword = async () => {
    if (!authClient || !user.email) return;
    setSettingPassword(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : "/reset-password";

    await authClient.requestPasswordReset({
      email: user.email,
      redirectTo,
    });

    setSettingPassword(false);
    setSetPasswordSent(true);
  };

  const handleResendVerification = async () => {
    if (!authClient || !user.email) return;
    setResendingVerification(true);

    await authClient.sendVerificationEmail({
      email: user.email,
      callbackURL:
        typeof window !== "undefined"
          ? `${window.location.origin}/verify-email`
          : "/verify-email",
    });

    setResendingVerification(false);
    setVerificationSent(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
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
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
        <p className="text-slate-400 mb-8">
          Manage your account security and linked sign-in methods.
        </p>

        {/* Email verification warning */}
        {!user.emailVerified && (
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-amber-200 font-medium text-sm">
                  Your email is not verified
                </p>
                <p className="text-amber-300/70 text-sm mt-1">
                  Please verify your email to access all features.
                </p>
                {verificationSent ? (
                  <p className="text-emerald-400 text-sm mt-2">
                    Verification email sent! Check your inbox.
                  </p>
                ) : (
                  <button
                    onClick={() => void handleResendVerification()}
                    disabled={resendingVerification}
                    className="mt-2 text-sm font-medium text-amber-300 hover:text-amber-200 underline disabled:opacity-50"
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

        {/* User info */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Account Info
          </h2>
          <div className="space-y-3">
            {user.image && (
              <div className="flex items-center gap-4">
                <img
                  src={user.image}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border-2 border-slate-600"
                />
                <div>
                  <p className="text-white font-medium">{user.name || "—"}</p>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                </div>
              </div>
            )}
            {!user.image && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Name</span>
                  <span className="text-white font-medium">
                    {user.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Email</span>
                  <span className="text-white font-medium">{user.email}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Linked Accounts */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Linked Accounts
          </h2>

          {loadingAccounts ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-blue-400 border-transparent" />
              Loading...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google */}
              <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24">
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
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Google</p>
                    {hasGoogle && (
                      <p className="text-slate-400 text-xs">Connected</p>
                    )}
                  </div>
                </div>
                {hasGoogle ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-900/40 text-emerald-400 border border-emerald-700/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                ) : (
                  <button
                    onClick={handleConnectGoogle}
                    className="px-3 py-1.5 text-xs font-medium text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-500/10 transition-colors"
                  >
                    Connect Google
                  </button>
                )}
              </div>

              {/* Email/Password */}
              <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-slate-300"
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
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      Email &amp; Password
                    </p>
                    {hasCredential && (
                      <p className="text-slate-400 text-xs">Password set</p>
                    )}
                  </div>
                </div>
                {hasCredential ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-900/40 text-emerald-400 border border-emerald-700/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400 border border-slate-600">
                    Not set
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Password Management */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Password</h2>

          {passwordMessage && (
            <div
              className={`rounded-lg p-3 mb-4 text-sm ${
                passwordMessage.type === "success"
                  ? "bg-emerald-900/30 border border-emerald-700/50 text-emerald-400"
                  : "bg-red-900/30 border border-red-700/50 text-red-400"
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          {hasCredential ? (
            <>
              {!changingPassword ? (
                <button
                  onClick={() => {
                    setChangingPassword(true);
                    setPasswordMessage(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-500/10 transition-colors"
                >
                  Change Password
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleChangePassword(e);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="current-pw"
                      className="block text-sm text-slate-400 mb-1"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current-pw"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="new-pw"
                      className="block text-sm text-slate-400 mb-1"
                    >
                      New Password (min 8 characters)
                    </label>
                    <input
                      type="password"
                      id="new-pw"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      maxLength={128}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirm-pw"
                      className="block text-sm text-slate-400 mb-1"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm-pw"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      maxLength={128}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {passwordLoading ? "Saving..." : "Save Password"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChangingPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordMessage(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-slate-400 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div>
              <p className="text-slate-400 text-sm mb-3">
                Add a password to sign in without Google or OTP.
              </p>
              {setPasswordSent ? (
                <p className="text-emerald-400 text-sm">
                  Check your inbox to set your password.
                </p>
              ) : (
                <button
                  onClick={() => void handleSetPassword()}
                  disabled={settingPassword}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {settingPassword ? "Sending..." : "Set Password"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
