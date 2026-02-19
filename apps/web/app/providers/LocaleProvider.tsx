"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locales, TranslationFunctions } from "../../i18n/i18n-types";
import {
  baseLocale,
  i18nObject,
  isLocale,
  loadedLocales,
} from "../../i18n/i18n-util";
import { loadLocaleAsync } from "../../i18n/i18n-util.async";

const STORAGE_KEY = "app-locale";

interface LocaleContextValue {
  locale: Locales;
  setLocale: (l: Locales) => void;
  LL: TranslationFunctions;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocaleContext must be used within LocaleProvider");
  return ctx;
}

function readStoredLocale(): Locales {
  if (typeof window === "undefined") return baseLocale;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isLocale(stored)) return stored;
  } catch {
    // localStorage unavailable
  }
  return baseLocale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locales>(baseLocale);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = readStoredLocale();
    void loadLocaleAsync(initial).then(() => {
      setLocaleState(initial);
      setReady(true);
    });
  }, []);

  const setLocale = useCallback((newLocale: Locales) => {
    void loadLocaleAsync(newLocale).then(() => {
      setLocaleState(newLocale);
      try {
        localStorage.setItem(STORAGE_KEY, newLocale);
      } catch {
        // localStorage unavailable
      }
    });
  }, []);

  const LL = useMemo(() => {
    if (!ready || !loadedLocales[locale]) return null;
    return i18nObject(locale);
  }, [locale, ready]);

  if (!LL) {
    return null;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, LL }}>
      {children}
    </LocaleContext.Provider>
  );
}
