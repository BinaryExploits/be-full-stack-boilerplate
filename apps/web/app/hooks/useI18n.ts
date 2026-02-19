"use client";

import { useI18nContext } from "../../i18n/i18n-react";
import { useLocaleContext } from "../providers/LocaleProvider";
import type { Locales, TranslationFunctions } from "../../i18n/i18n-types";

interface UseI18nReturn {
  LL: TranslationFunctions;
  locale: Locales;
  setLocale: (l: Locales) => void;
}

export function useI18n(): UseI18nReturn {
  const { LL } = useI18nContext();
  const { locale, setLocale } = useLocaleContext();
  return { LL, locale, setLocale };
}
