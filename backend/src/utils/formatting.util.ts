// src/utils/formatting.ts

import { format } from "date-fns";
import { enUS, ru } from "date-fns/locale";

type SupportedLocale = "en" | "ru" | "uz";

// Create a map of locales using the proper imports
const localeMap = {
  en: enUS,
  ru: ru,
  uz: enUS, // Fallback to English for Uzbek
} as const;

/**
 * Formats a date and time according to the specified locale
 */
export const formatDateTime = (
  date: Date | number,
  locale: SupportedLocale = "en"
): string => {
  return format(date, "PPpp", {
    locale: localeMap[locale] || localeMap.en,
  });
};

/**
 * Formats just the date according to the specified locale
 */
export const formatDate = (
  date: Date | number,
  locale: SupportedLocale = "en"
): string => {
  return format(date, "PP", {
    locale: localeMap[locale] || localeMap.en,
  });
};

/**
 * Formats just the time according to the specified locale
 */
export const formatTime = (
  date: Date | number,
  locale: SupportedLocale = "en"
): string => {
  return format(date, "pp", {
    locale: localeMap[locale] || localeMap.en,
  });
};

/**
 * Formats currency according to the specified locale
 */
export const formatCurrency = (
  amount: number,
  locale: string = "en"
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
};
