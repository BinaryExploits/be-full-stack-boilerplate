"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Locales } from "../../i18n/i18n-types";
import { baseLocale, isLocale, loadedLocales } from "../../i18n/i18n-util";
import { loadLocaleAsync } from "../../i18n/i18n-util.async";
import TypesafeI18n from "../../i18n/i18n-react";

const STORAGE_KEY = "app-locale";

interface LocaleContextValue {
  locale: Locales;
  setLocale: (l: Locales) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: baseLocale,
  setLocale: () => {},
});

export function useLocaleContext() {
  return useContext(LocaleContext);
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

  if (!ready || !loadedLocales[locale]) {
    return null;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <TypesafeI18n locale={locale}>{children}</TypesafeI18n>
    </LocaleContext.Provider>
  );
}
