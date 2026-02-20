"use client";

import Link from "next/link";
import { useI18n } from "../hooks/useI18n";

export default function PrivacyPage() {
  const { LL } = useI18n();

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
          {LL.Common.back()}
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {LL.Privacy.title()}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {LL.Privacy.lastUpdated()}
          </p>

          <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">
            {/* ── What we collect ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {LL.Privacy.section1Title()}
              </h2>
              <p>{LL.Privacy.section1Intro()}</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>
                  <strong>{LL.Privacy.collectName()}</strong>{" "}
                  {LL.Privacy.collectNameDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.collectImage()}</strong>{" "}
                  {LL.Privacy.collectImageDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.collectPassword()}</strong>{" "}
                  {LL.Privacy.collectPasswordDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.collectOAuth()}</strong>{" "}
                  {LL.Privacy.collectOAuthDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.collectIp()}</strong>{" "}
                  {LL.Privacy.collectIpDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.collectConsent()}</strong>{" "}
                  {LL.Privacy.collectConsentDetail()}
                </li>
              </ul>
            </section>

            {/* ── How we use it ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {LL.Privacy.section2Title()}
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>{LL.Privacy.useAuth()}</strong>{" "}
                  {LL.Privacy.useAuthDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.useAccount()}</strong>{" "}
                  {LL.Privacy.useAccountDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.useEmail()}</strong>{" "}
                  {LL.Privacy.useEmailDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.useSecurity()}</strong>{" "}
                  {LL.Privacy.useSecurityDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.useDrive()}</strong>{" "}
                  {LL.Privacy.useDriveDetail()}
                </li>
              </ul>
              <p className="mt-2">{LL.Privacy.noSellData()}</p>
            </section>

            {/* ── Cookies ── */}
            <section id="cookies">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {LL.Privacy.section3Title()}
              </h2>
              <p>
                {LL.Privacy.cookiesIntro()}{" "}
                <strong>{LL.Privacy.cookiesIntroStrict()}</strong>
                {LL.Privacy.cookiesIntroSuffix()}
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left border border-gray-200 dark:border-slate-600 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-4 py-2 border-b dark:border-slate-600 font-medium">
                        {LL.Privacy.cookieHeader()}
                      </th>
                      <th className="px-4 py-2 border-b dark:border-slate-600 font-medium">
                        {LL.Privacy.purposeHeader()}
                      </th>
                      <th className="px-4 py-2 border-b dark:border-slate-600 font-medium">
                        {LL.Privacy.expiryHeader()}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-b text-xs font-medium">
                        {LL.Privacy.cookieSessionToken()}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {LL.Privacy.cookieSessionPurpose()}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {LL.Privacy.cookieSessionExpiry()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-xs font-medium">
                        {LL.Privacy.cookieOAuthState()}
                      </td>
                      <td className="px-4 py-2">
                        {LL.Privacy.cookieOAuthPurpose()}
                      </td>
                      <td className="px-4 py-2">
                        {LL.Privacy.cookieOAuthExpiry()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">{LL.Privacy.cookiesFootnote()}</p>
            </section>

            {/* ── Third parties ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {LL.Privacy.section4Title()}
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>{LL.Privacy.thirdPartyGoogle()}</strong>{" "}
                  {LL.Privacy.thirdPartyGoogleDetail()}{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {LL.Privacy.googlePrivacyPolicy()}
                  </a>
                  .
                </li>
                <li>
                  <strong>{LL.Privacy.thirdPartyAws()}</strong>{" "}
                  {LL.Privacy.thirdPartyAwsDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.thirdPartyRollbar()}</strong>{" "}
                  {LL.Privacy.thirdPartyRollbarDetail()}
                </li>
              </ul>
            </section>

            {/* ── Security ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {LL.Privacy.section5Title()}
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>{LL.Privacy.protectPassword()}</li>
                <li>{LL.Privacy.protectOAuth()}</li>
                <li>{LL.Privacy.protectCookies()}</li>
                <li>{LL.Privacy.protectLogs()}</li>
                <li>{LL.Privacy.protectHttps()}</li>
              </ul>
            </section>

            {/* ── Your rights ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {LL.Privacy.section6Title()}
              </h2>
              <p>{LL.Privacy.rightsIntro()}</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>
                  <strong>{LL.Privacy.rightAccess()}</strong>{" "}
                  {LL.Privacy.rightAccessDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.rightRectify()}</strong>{" "}
                  {LL.Privacy.rightRectifyDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.rightDelete()}</strong>{" "}
                  {LL.Privacy.rightDeleteDetail()}
                </li>
                <li>
                  <strong>{LL.Privacy.rightWithdraw()}</strong>{" "}
                  {LL.Privacy.rightWithdrawDetail()}
                </li>
              </ul>
              <p className="mt-2">{LL.Privacy.rightsAuditNote()}</p>
            </section>

            {/* ── Retention ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {LL.Privacy.section7Title()}
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>{LL.Privacy.retainAccount()}</li>
                <li>{LL.Privacy.retainSessions()}</li>
                <li>{LL.Privacy.retainVerification()}</li>
                <li>{LL.Privacy.retainDeletion()}</li>
              </ul>
            </section>

            {/* ── Contact ── */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {LL.Privacy.section8Title()}
              </h2>
              <p>
                {LL.Privacy.contactText()}{" "}
                <a
                  href="mailto:anns.shahbaz@binaryexports.com"
                  className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300"
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
