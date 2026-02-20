"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuthClient } from "../lib/auth/auth-client";
import { useI18n } from "../hooks/useI18n";
import { trpc } from "@repo/trpc/client";

interface AccountInfo {
  id: string;
  providerId: string;
  accountId: string;
}

export default function ProfilePage() {
  const { LL } = useI18n();
  const authClient = useAuthClient();
  const sessionResult = authClient?.useSession?.();
  const session = sessionResult?.data;
  const user = session?.user;

  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMessage, setNameMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [downloadingData, setDownloadingData] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const updateProfileMutation = trpc.gdpr.updateProfile.useMutation();
  const deleteAccountMutation = trpc.gdpr.deleteAccount.useMutation();

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
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
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
      setPasswordMessage({
        type: "error",
        text: LL.Errors.passwordsDoNotMatch(),
      });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: LL.Errors.passwordMinLength(),
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
        text: error.message ?? LL.Errors.failedChangePassword(),
      });
      return;
    }

    setPasswordMessage({
      type: "success",
      text: LL.Errors.passwordChangedSuccess(),
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

  const NAME_REGEX = /^[a-zA-Z\s'-]+$/;

  const validateName = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return LL.Errors.nameRequired({ label: LL.Forms.name() });
    if (trimmed.length < 2)
      return LL.Errors.nameMinLength({ label: LL.Forms.name() });
    if (trimmed.length > 100)
      return LL.Errors.nameInvalidChars({ label: LL.Forms.name() });
    if (!NAME_REGEX.test(trimmed))
      return LL.Errors.nameInvalidChars({ label: LL.Forms.name() });
    return null;
  };

  const handleUpdateName = async () => {
    const error = validateName(nameValue);
    if (error) {
      setNameError(error);
      return;
    }
    setNameLoading(true);
    setNameMessage(null);
    setNameError(null);

    try {
      await updateProfileMutation.mutateAsync({ name: nameValue.trim() });

      if (authClient) {
        await authClient.updateUser({ name: nameValue.trim() });
      }

      setNameMessage({ type: "success", text: LL.Settings.nameUpdated() });
      setEditingName(false);
    } catch (err) {
      setNameMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : LL.Settings.failedUpdateName(),
      });
    }
    setNameLoading(false);
  };

  const handleDownloadData = async () => {
    setDownloadingData(true);
    setDownloadSuccess(false);
    try {
      const data = await utils.gdpr.exportData.fetch();

      await new Promise((r) => setTimeout(r, 600));

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-data-export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch {
      // download failed silently
    }
    setDownloadingData(false);
  };

  const handleDeleteAccount = async () => {
    if (!user?.email || deleteConfirmEmail !== user.email) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteAccountMutation.mutateAsync({
        confirmation: deleteConfirmEmail,
      });

      await new Promise((r) => setTimeout(r, 5000));

      window.location.href = "/sign-in";
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : LL.Settings.failedDeleteAccount(),
      );
      setDeleteLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
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

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {LL.Settings.profileTitle()}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mb-8">
          {LL.Settings.profileSubtitle()}
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
                <p className="text-amber-700 dark:text-amber-200 font-medium text-sm">
                  {LL.Settings.emailNotVerified()}
                </p>
                <p className="text-amber-600/70 dark:text-amber-300/70 text-sm mt-1">
                  {LL.Settings.verifyEmailPrompt()}
                </p>
                {verificationSent ? (
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-2">
                    {LL.Auth.verificationEmailSent()}
                  </p>
                ) : (
                  <button
                    onClick={() => void handleResendVerification()}
                    disabled={resendingVerification}
                    className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 underline disabled:opacity-50"
                  >
                    {resendingVerification
                      ? LL.Common.sending()
                      : LL.Auth.resendVerificationEmail()}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User info */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {LL.Settings.accountInfo()}
          </h2>
          <div className="space-y-3">
            {user.image && (
              <div className="flex items-center gap-4">
                <img
                  src={user.image}
                  alt={LL.Settings.profileTitle()}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-slate-600"
                />
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.name || "—"}
                  </p>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
            {!user.image && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-slate-400 text-sm">
                    {LL.Forms.name()}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {user.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-slate-400 text-sm">
                    {LL.Forms.email()}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {user.email}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Linked Accounts */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {LL.Settings.linkedAccounts()}
          </h2>

          {loadingAccounts ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-blue-400 border-transparent" />
              {LL.Common.loading()}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-gray-600 dark:text-slate-300"
                      viewBox="0 0 24 24"
                    >
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
                    <p className="text-gray-900 dark:text-white text-sm font-medium">
                      {LL.Settings.google()}
                    </p>
                    {hasGoogle && (
                      <p className="text-gray-500 dark:text-slate-400 text-xs">
                        {LL.Settings.connected()}
                      </p>
                    )}
                  </div>
                </div>
                {hasGoogle ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    {LL.Settings.connected()}
                  </span>
                ) : (
                  <button
                    onClick={handleConnectGoogle}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-500/10 transition-colors"
                  >
                    {LL.Settings.connectGoogle()}
                  </button>
                )}
              </div>

              {/* Email/Password */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-gray-600 dark:text-slate-300"
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
                    <p className="text-gray-900 dark:text-white text-sm font-medium">
                      {LL.Settings.emailAndPassword()}
                    </p>
                    {hasCredential && (
                      <p className="text-gray-500 dark:text-slate-400 text-xs">
                        {LL.Settings.passwordSet()}
                      </p>
                    )}
                  </div>
                </div>
                {hasCredential ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    {LL.Settings.connected()}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600">
                    {LL.Settings.notSet()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Password Management */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {LL.Settings.passwordTitle()}
          </h2>

          {passwordMessage && (
            <div
              className={`rounded-lg p-3 mb-4 text-sm ${
                passwordMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 text-red-600 dark:text-red-400"
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
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-500/10 transition-colors"
                >
                  {LL.Settings.changePassword()}
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
                      className="block text-sm text-gray-500 dark:text-slate-400 mb-1"
                    >
                      {LL.Settings.currentPassword()}
                    </label>
                    <input
                      type="password"
                      id="current-pw"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder={LL.Forms.passwordPlaceholder()}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="new-pw"
                      className="block text-sm text-gray-500 dark:text-slate-400 mb-1"
                    >
                      {LL.Settings.newPasswordLabel()}
                    </label>
                    <input
                      type="password"
                      id="new-pw"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      maxLength={128}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder={LL.Forms.passwordPlaceholder()}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirm-pw"
                      className="block text-sm text-gray-500 dark:text-slate-400 mb-1"
                    >
                      {LL.Settings.confirmNewPassword()}
                    </label>
                    <input
                      type="password"
                      id="confirm-pw"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      maxLength={128}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder={LL.Forms.passwordPlaceholder()}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {passwordLoading
                        ? LL.Common.saving()
                        : LL.Settings.savePassword()}
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
                      className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      {LL.Common.cancel()}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-3">
                {LL.Settings.addPasswordDescription()}
              </p>
              {setPasswordSent ? (
                <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                  {LL.Settings.checkInboxForPassword()}
                </p>
              ) : (
                <button
                  onClick={() => void handleSetPassword()}
                  disabled={settingPassword}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {settingPassword
                    ? LL.Common.sending()
                    : LL.Auth.setPassword()}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Edit Profile */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 mb-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {LL.Settings.editProfile()}
          </h2>

          {nameMessage && (
            <div
              className={`rounded-lg p-3 mb-4 text-sm ${
                nameMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 text-red-600 dark:text-red-400"
              }`}
            >
              {nameMessage.text}
            </div>
          )}

          {!editingName ? (
            <button
              onClick={() => {
                setEditingName(true);
                setNameValue(user.name || "");
                setNameMessage(null);
                setNameError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-500/10 transition-colors"
            >
              {LL.Settings.editName()}
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-sm text-gray-500 dark:text-slate-400 mb-1"
                >
                  {LL.Settings.fullName()}
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={nameValue}
                  onChange={(e) => {
                    setNameValue(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  maxLength={100}
                  className={`w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${nameError ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                  placeholder={LL.Settings.fullNamePlaceholder()}
                />
                {nameError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {nameError}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                  {LL.Settings.nameHint()}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => void handleUpdateName()}
                  disabled={nameLoading || !nameValue.trim()}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {nameLoading ? LL.Common.saving() : LL.Common.save()}
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNameMessage(null);
                    setNameError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {LL.Common.cancel()}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Privacy & GDPR */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {LL.Settings.dataAndPrivacy()}
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
            {LL.Settings.dataPrivacyDescription()}{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300"
            >
              {LL.Settings.privacyAndDataPolicy()}
            </Link>
            .
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-slate-700">
              <div>
                <p className="text-gray-900 dark:text-white text-sm font-medium">
                  {LL.Settings.downloadMyData()}
                </p>
                <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
                  {LL.Settings.downloadMyDataDescription()}
                </p>
              </div>
              <button
                onClick={() => void handleDownloadData()}
                disabled={downloadingData}
                className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors disabled:opacity-50 ${downloadSuccess ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/50" : "text-blue-600 dark:text-blue-400 border-blue-500/50 hover:bg-blue-500/10"}`}
              >
                {downloadingData
                  ? LL.Settings.preparingExport()
                  : downloadSuccess
                    ? LL.Settings.downloaded()
                    : LL.Settings.download()}
              </button>
            </div>

            <div className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                    {LL.Settings.deleteAccount()}
                  </p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
                    {LL.Settings.deleteAccountDescription()}
                  </p>
                </div>
                {!showDeleteConfirm && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    {LL.Common.delete()}
                  </button>
                )}
              </div>

              {showDeleteConfirm && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                    {LL.Settings.deleteConfirmPrefix()}{" "}
                    <span className="font-mono font-bold text-red-700 dark:text-red-200">
                      {user.email}
                    </span>{" "}
                    {LL.Settings.deleteConfirmSuffix()}
                  </p>
                  <input
                    type="email"
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    placeholder={LL.Settings.typeEmailToConfirm()}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-red-200 dark:border-red-600/50 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm mb-3"
                  />
                  {deleteError && (
                    <p className="text-red-600 dark:text-red-400 text-xs mb-3">
                      {deleteError}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => void handleDeleteAccount()}
                      disabled={
                        deleteLoading || deleteConfirmEmail !== user.email
                      }
                      className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteLoading
                        ? LL.Settings.deleting()
                        : LL.Settings.permanentlyDeleteAccount()}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmEmail("");
                        setDeleteError(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      {LL.Common.cancel()}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
