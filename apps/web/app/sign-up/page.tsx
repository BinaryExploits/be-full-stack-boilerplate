"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthClient } from "../lib/auth/auth-client";
import { useI18n } from "../hooks/useI18n";
import type { TranslationFunctions } from "../../i18n/i18n-types";

const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateName(
  value: string,
  label: string,
  E: TranslationFunctions["Errors"],
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return E.nameRequired({ label });
  if (trimmed.length < 2) return E.nameMinLength({ label });
  if (!NAME_REGEX.test(trimmed)) return E.nameInvalidChars({ label });
  return null;
}

function validateEmail(
  value: string,
  E: TranslationFunctions["Errors"],
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return E.emailRequired();
  if (!EMAIL_REGEX.test(trimmed)) return E.emailInvalid();
  return null;
}

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

export default function SignUpPage() {
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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const E = LL.Errors;

    const firstErr = validateName(firstName, LL.Forms.firstName(), E);
    if (firstErr) errors.firstName = firstErr;

    const lastErr = validateName(lastName, LL.Forms.lastName(), E);
    if (lastErr) errors.lastName = lastErr;

    const emailErr = validateEmail(email, E);
    if (emailErr) errors.email = emailErr;

    const pwErr = validatePassword(password, E);
    if (pwErr) errors.password = pwErr;

    if (!consent)
      errors.consent =
        "You must consent to data processing to create an account";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authClient) return;

    if (!validate()) return;

    setLoading(true);
    setError(null);

    const callbackURL =
      typeof globalThis.location !== "undefined"
        ? `${globalThis.location.origin}/`
        : "/";

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const { error: err } = await authClient.signUp.email({
      name: fullName,
      email: email.trim(),
      password,
      callbackURL,
    });

    setLoading(false);

    if (err) {
      if (
        err.message?.toLowerCase().includes("user already exists") ||
        err.message?.toLowerCase().includes("already in use")
      ) {
        setError(LL.Errors.accountAlreadyExists());
      } else {
        setError(err.message ?? LL.Errors.signUpFailed());
      }
      return;
    }

    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {LL.Auth.signUpTitle()}
            </h1>
            <p className="text-gray-600">{LL.Auth.signUpSubtitle()}</p>
          </div>

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
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSignUp(e);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {LL.Forms.firstName()}
                </label>
                <input
                  type="text"
                  id="first-name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (fieldErrors.firstName) clearFieldError("firstName");
                  }}
                  required
                  placeholder={LL.Forms.firstNamePlaceholder()}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.firstName ? "border-red-400" : "border-gray-300"}`}
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {LL.Forms.lastName()}
                </label>
                <input
                  type="text"
                  id="last-name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (fieldErrors.lastName) clearFieldError("lastName");
                  }}
                  required
                  placeholder={LL.Forms.lastNamePlaceholder()}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.lastName ? "border-red-400" : "border-gray-300"}`}
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {LL.Forms.email()}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) clearFieldError("email");
                }}
                required
                placeholder={LL.Forms.emailPlaceholder()}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.email ? "border-red-400" : "border-gray-300"}`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>
            <div suppressHydrationWarning>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {LL.Forms.password()}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) clearFieldError("password");
                }}
                required
                maxLength={128}
                placeholder={LL.Forms.passwordPlaceholder()}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.password ? "border-red-400" : "border-gray-300"}`}
              />
              {fieldErrors.password ? (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.password}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {LL.Auth.passwordMinChars()}
                </p>
              )}
            </div>
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (fieldErrors.consent) clearFieldError("consent");
                  }}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the processing of my personal data as described in
                  the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-blue-600 underline hover:text-blue-700"
                  >
                    Privacy &amp; Data Policy
                  </Link>
                  . You can withdraw consent at any time by deleting your
                  account.
                </span>
              </label>
              {fieldErrors.consent && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.consent}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !consent}
              className="w-full px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? LL.Auth.creatingAccount() : LL.Auth.signUp()}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {LL.Auth.alreadyHaveAccount()}{" "}
            <Link
              href="/sign-in"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {LL.Auth.signIn()}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
