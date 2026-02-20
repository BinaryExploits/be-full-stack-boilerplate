import Link from "next/link";

export const metadata = {
  title: "Privacy & Data Policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
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
          Back
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Privacy &amp; Data Policy
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Last updated: February 20, 2026
          </p>

          <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">
            {/* ── What we collect ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                1. What data we collect
              </h2>
              <p>When you create an account we store:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>
                  <strong>Name and email</strong> &mdash; provided by you or
                  your Google account.
                </li>
                <li>
                  <strong>Profile picture URL</strong> &mdash; from Google if
                  you sign in with Google.
                </li>
                <li>
                  <strong>Password</strong> &mdash; if you use email/password
                  sign-in. Stored encrypted; we never see or store it in plain
                  text.
                </li>
                <li>
                  <strong>OAuth tokens</strong> &mdash; if you sign in with
                  Google. Stored encrypted. Used to maintain your Google session
                  and access Google Drive on your behalf if you granted those
                  permissions.
                </li>
                <li>
                  <strong>IP address and user agent</strong> &mdash; recorded
                  per session for security and audit purposes.
                </li>
                <li>
                  <strong>Consent timestamp and IP</strong> &mdash; recorded
                  when you agree to this policy.
                </li>
              </ul>
            </section>

            {/* ── How we use it ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                2. How we use your data
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Authentication</strong> &mdash; to sign you in, verify
                  your email, and manage your sessions.
                </li>
                <li>
                  <strong>Account management</strong> &mdash; to display your
                  profile and let you update or delete it.
                </li>
                <li>
                  <strong>Transactional emails</strong> &mdash; to send OTPs,
                  verification links, and password reset links. We never send
                  marketing email.
                </li>
                <li>
                  <strong>Security</strong> &mdash; to detect suspicious
                  activity and maintain audit logs.
                </li>
                <li>
                  <strong>Google Drive</strong> &mdash; if you granted Drive
                  scopes, to read or create files in your Drive on your behalf.
                  We do not access Drive without your explicit scope grant.
                </li>
              </ul>
              <p className="mt-2">
                We do not sell, share, or rent your personal data to third
                parties. We do not use your data for advertising or profiling.
              </p>
            </section>

            {/* ── Cookies ── */}
            <section id="cookies">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                3. Cookies
              </h2>
              <p>
                We use <strong>strictly necessary cookies only</strong>. No
                analytics, advertising, or tracking cookies.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 border-b font-medium">Cookie</th>
                      <th className="px-4 py-2 border-b font-medium">
                        Purpose
                      </th>
                      <th className="px-4 py-2 border-b font-medium">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-b text-xs font-medium">
                        Session Token
                      </td>
                      <td className="px-4 py-2 border-b">
                        Keeps you signed in across visits
                      </td>
                      <td className="px-4 py-2 border-b">7 days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-xs font-medium">
                        OAuth State
                      </td>
                      <td className="px-4 py-2">
                        Temporary token to secure the Google sign-in flow
                      </td>
                      <td className="px-4 py-2">3 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                These cookies are required for the application to function. They
                cannot be used to track you across other websites.
              </p>
            </section>

            {/* ── Third parties ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                4. Third-party services
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Google (OAuth)</strong> &mdash; for sign-in and Drive
                  access. Subject to{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Google&apos;s Privacy Policy
                  </a>
                  .
                </li>
                <li>
                  <strong>Amazon Web Services (SES)</strong> &mdash; to deliver
                  transactional emails. AWS processes recipient email addresses
                  solely for delivery.
                </li>
                <li>
                  <strong>Rollbar</strong> &mdash; for error monitoring.
                  Receives error messages and stack traces only; no user PII is
                  intentionally sent.
                </li>
              </ul>
            </section>

            {/* ── Security ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                5. How we protect your data
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Passwords are stored encrypted and can never be read back.
                </li>
                <li>OAuth tokens are encrypted at rest on our servers.</li>
                <li>Session cookies are secured and signed.</li>
                <li>Email addresses are not stored in application logs.</li>
                <li>All communication is over HTTPS in production.</li>
              </ul>
            </section>

            {/* ── Your rights ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                6. Your rights
              </h2>
              <p>From your profile page you can:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>
                  <strong>Access</strong> &mdash; download all personal data we
                  hold about you as a JSON file.
                </li>
                <li>
                  <strong>Rectify</strong> &mdash; update your name and profile
                  picture.
                </li>
                <li>
                  <strong>Delete</strong> &mdash; permanently delete your
                  account and all associated data (sessions, OAuth tokens,
                  tenant memberships, verification tokens). This action is
                  irreversible.
                </li>
                <li>
                  <strong>Withdraw consent</strong> &mdash; by deleting your
                  account.
                </li>
              </ul>
              <p className="mt-2">
                All data subject actions are recorded in an internal audit log.
              </p>
            </section>

            {/* ── Retention ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                7. Data retention
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Account data is kept for as long as your account exists.
                </li>
                <li>Sessions expire after 7 days.</li>
                <li>
                  Verification tokens (email, OTP, password reset) are
                  automatically purged after expiry.
                </li>
                <li>
                  When you delete your account, all personal data is permanently
                  removed. GDPR audit log entries (which contain only your user
                  ID and action type) are retained for legal accountability.
                </li>
              </ul>
            </section>

            {/* ── Contact ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                8. Contact
              </h2>
              <p>
                For privacy-related questions or requests, email us at{" "}
                <a
                  href="mailto:anns.shahbaz@binaryexports.com"
                  className="text-blue-600 underline"
                >
                  anns.shahbaz@binaryexports.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
