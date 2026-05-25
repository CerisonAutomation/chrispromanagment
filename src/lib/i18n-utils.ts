import en from '@/i18n/locales/en.json';
import mt from '@/i18n/locales/mt.json';
import it from '@/i18n/locales/it.json';
import fr from '@/i18n/locales/fr.json';
import de from '@/i18n/locales/de.json';
import es from '@/i18n/locales/es.json';

export type Locale = 'en' | 'mt' | 'it' | 'fr' | 'de' | 'es';

export const locales: Record<Locale, any> = {
  en,
  mt,
  it,
  fr,
  de,
  es
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  mt: '🇲🇹',
  it: '🇮🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸'
};

export const rtlLocales: Locale[] = []; // No RTL locales in our set

export const defaultLocale: Locale = 'en';

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function pluralize(
  count: number,
  singular: string,
  plural: string,
  locale: Locale = defaultLocale
): string {
  // Simple pluralization, can be extended for more complex languages
  if (locale === 'en') {
    return count === 1 ? singular : plural;
  }
  // Add more locale-specific pluralization rules as needed
  return count === 1 ? singular : plural;
}

export function getBrowserLocale(): Locale {
  const browserLang = navigator.language.split('-')[0] as Locale;
  return Object.keys(locales).includes(browserLang) ? browserLang : defaultLocale;
}

export function loadLocale(locale: Locale): any {
  return locales[locale] || locales[defaultLocale];
}
