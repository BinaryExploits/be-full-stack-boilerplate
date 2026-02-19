"use client";

import { useState, useRef, useEffect } from "react";
import { useLocaleContext } from "../providers/LocaleProvider";
import type { Locales } from "../../i18n/i18n-types";
import { locales } from "../../i18n/i18n-util";

const localeLabels: Record<Locales, string> = {
  en: "English",
  nl: "Nederlands",
};

export function LanguageSelector() {
  const { locale, setLocale } = useLocaleContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg px-2.5 py-1.5 text-sm text-white transition-colors"
      >
        <svg
          className="w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
        <span className="max-w-[80px] truncate">{localeLabels[locale]}</span>
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                l === locale
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              {localeLabels[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
