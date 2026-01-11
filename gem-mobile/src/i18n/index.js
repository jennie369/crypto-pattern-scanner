/**
 * Gemral - i18n Configuration
 * Multi-language support with i18next
 *
 * Supported languages:
 * - vi: Tiếng Việt (Vietnamese) - Default
 * - en: English
 * - zh: 中文 (Chinese Simplified)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import locale files
import en from './locales/en.json';
import vi from './locales/vi.json';
import zh from './locales/zh.json';

// Language options for UI
export const LANGUAGE_OPTIONS = [
  { value: 'vi', label: 'Tiếng Việt', nativeLabel: 'Tiếng Việt' },
  { value: 'en', label: 'English', nativeLabel: 'English' },
  { value: 'zh', label: '中文', nativeLabel: '中文 (简体)' },
];

// Get language label by code
export function getLanguageLabel(code) {
  const lang = LANGUAGE_OPTIONS.find(l => l.value === code);
  return lang ? lang.nativeLabel : code;
}

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
      zh: { translation: zh },
    },
    lng: 'vi', // Default language
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

/**
 * Change language
 * @param {string} lng - Language code (en, vi, zh)
 */
export async function changeLanguage(lng) {
  await i18n.changeLanguage(lng);
}

/**
 * Get current language
 * @returns {string} Current language code
 */
export function getCurrentLanguage() {
  return i18n.language;
}

export default i18n;
