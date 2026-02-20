"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "../hooks/useI18n";

const STORAGE_KEY = "cookie-consent-acknowledged";

export function CookieBanner() {
  const { LL } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const acknowledge = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-gray-700 dark:text-slate-300">
          {LL.CookieBanner.text()}{" "}
          <Link
            href="/privacy#cookies"
            className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {LL.CookieBanner.learnMore()}
          </Link>
        </div>
        <button
          onClick={acknowledge}
          className="shrink-0 px-5 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          {LL.CookieBanner.gotIt()}
        </button>
      </div>
    </div>
  );
}
