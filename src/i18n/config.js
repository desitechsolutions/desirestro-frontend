import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import hiCommon from './locales/hi/common.json';
import teCommon from './locales/te/common.json';

const resources = {
  en: {
    common: enCommon
  },
  hi: {
    common: hiCommon
  },
  te: {
    common: teCommon
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    load: 'languageOnly', // strips region codes (e.g. 'en-US' → 'en')
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    react: {
      useSuspense: false
    }
  });

export default i18n;

// Made with Bob
