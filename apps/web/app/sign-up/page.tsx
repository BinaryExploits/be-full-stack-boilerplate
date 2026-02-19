"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthClient } from "../lib/auth/auth-client";

const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateName(value: string, label: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < 2) return `${label} must be at least 2 characters.`;
  if (!NAME_REGEX.test(trimmed))
    return `${label} can only contain letters, spaces, hyphens, and apostrophes.`;
  return null;
}

function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Email is required.";
  if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address.";
  return null;
}

function validatePassword(value: string): string | null {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (value.length > 128) return "Password must be at most 128 characters.";
  if (!/[A-Z]/.test(value))
    return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(value))
    return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(value)) return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(value))
    return "Password must contain at least one special character.";
  return null;
}

export default function SignUpPage() {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

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

    const firstErr = validateName(firstName, "First name");
    if (firstErr) errors.firstName = firstErr;

    const lastErr = validateName(lastName, "Last name");
    if (lastErr) errors.lastName = lastErr;

    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;

    const pwErr = validatePassword(password);
    if (pwErr) errors.password = pwErr;

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
      typeof window !== "undefined"
        ? `${window.location.origin}/verify-email`
        : "/verify-email";

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
        setError(
          "An account with this email already exists. Try signing in instead — if you used Google or OTP, you can set a password from your profile.",
        );
      } else {
        setError(err.message ?? "Sign up failed. Please try again.");
      }
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-emerald-600"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Check your inbox
          </h1>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a verification email to{" "}
            <span className="font-medium text-gray-900">{email}</span>. Please
            check your inbox and click the link to verify your account before
            signing in.
          </p>
          <Link
            href="/sign-in"
            className="inline-block text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create an account
            </h1>
            <p className="text-gray-600">
              Sign up with your email and password
            </p>
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
                  First Name
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
                  placeholder="John"
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
                  Last Name
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
                  placeholder="Doe"
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
                Email
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
                placeholder="you@example.com"
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
                Password
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
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${fieldErrors.password ? "border-red-400" : "border-gray-300"}`}
              />
              {fieldErrors.password ? (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.password}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Min 8 characters with uppercase, lowercase, number, and
                  special character.
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
