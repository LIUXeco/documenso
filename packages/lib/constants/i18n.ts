import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { SUPPORTED_LANGUAGE_CODES, type SupportedLanguageCodes } from './locales';

export * from './locales';

export type I18nLocaleData = {
  /**
   * The supported language extracted from the locale.
   */
  lang: SupportedLanguageCodes;

  /**
   * The preferred locales.
   */
  locales: string[];
};

type SupportedLanguage = {
  short: string;
  full: MessageDescriptor;
  native: string;
};

export const SUPPORTED_LANGUAGES: Record<string, SupportedLanguage> = {
  de: {
    short: 'de',
    full: msg`German`,
    native: 'Deutsch',
  },
  en: {
    short: 'en',
    full: msg`English`,
    native: 'English',
  },
  fr: {
    short: 'fr',
    full: msg`French`,
    native: 'Français',
  },
  es: {
    short: 'es',
    full: msg`Spanish`,
    native: 'Español',
  },
  it: {
    short: 'it',
    full: msg`Italian`,
    native: 'Italiano',
  },
  nl: {
    short: 'nl',
    full: msg`Dutch`,
    native: 'Nederlands',
  },
  pl: {
    short: 'pl',
    full: msg`Polish`,
    native: 'Polski',
  },
  'pt-BR': {
    short: 'pt-BR',
    full: msg`Portuguese (Brazil)`,
    native: 'Português (Brasil)',
  },
  ja: {
    short: 'ja',
    full: msg`Japanese`,
    native: '日本語',
  },
  ko: {
    short: 'ko',
    full: msg`Korean`,
    native: '한국어',
  },
  zh: {
    short: 'zh',
    full: msg`Chinese`,
    native: '中文',
  },
} satisfies Record<SupportedLanguageCodes, SupportedLanguage>;

export const isValidLanguageCode = (code: unknown): code is SupportedLanguageCodes =>
  SUPPORTED_LANGUAGE_CODES.includes(code as SupportedLanguageCodes);
