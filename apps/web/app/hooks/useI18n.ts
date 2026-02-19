"use client";

import { useLocaleContext } from "../providers/LocaleProvider";
import type { Locales, TranslationFunctions } from "../../i18n/i18n-types";

interface UseI18nReturn {
  LL: TranslationFunctions;
  locale: Locales;
  setLocale: (l: Locales) => void;
}

export function useI18n(): UseI18nReturn {
  const { LL, locale, setLocale } = useLocaleContext();
  return { LL, locale, setLocale };
}
