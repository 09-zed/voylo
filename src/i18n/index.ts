import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import fr from './fr';
import en from './en';

// Structure of a translation file, derived from the French source.
type DeepStringify<T> = { [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]> };
export type Translations = DeepStringify<typeof fr>;

const i18n = new I18n({ fr, en });

i18n.defaultLocale = 'fr';
i18n.enableFallback = true;

const deviceLanguage = getLocales()[0]?.languageCode ?? 'fr';
i18n.locale = deviceLanguage === 'en' ? 'en' : 'fr';

export const locale = i18n.locale;

export function t(key: string, options?: Record<string, string | number>) {
  return i18n.t(key, options);
}
