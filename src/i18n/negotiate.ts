import { defaultLocale, locales, type Locale } from './config';

type LanguagePreference = { locale: Locale; quality: number; order: number };

export function negotiate(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;

  const preferences: LanguagePreference[] = acceptLanguage
    .split(',')
    .map((part, order) => {
      const [rawTag, ...parameters] = part.trim().split(';');
      const qualityParameter = parameters.find((parameter) => /^\s*q\s*=/i.test(parameter));
      const quality = qualityParameter
        ? Number(qualityParameter.split('=')[1])
        : 1;
      const baseTag = rawTag?.trim().toLowerCase().split('-')[0];

      return {
        locale: locales.find((locale) => locale === baseTag),
        quality: Number.isFinite(quality) && quality >= 0 && quality <= 1 ? quality : 0,
        order,
      };
    })
    .filter((item): item is LanguagePreference => item.locale !== undefined && item.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.order - b.order);

  return preferences[0]?.locale ?? defaultLocale;
}
