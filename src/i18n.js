import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fi from './locales/fi.json';
import sv from './locales/sv.json';
import en from './locales/en.json';

// Hae tallennettu kieli tai käytä selaimen kieltä
const savedLanguage = localStorage.getItem('language');
const browserLanguage = navigator.language.split('-')[0]; // 'fi-FI' -> 'fi'
const defaultLanguage = savedLanguage || (browserLanguage === 'sv' || browserLanguage === 'en' ? browserLanguage : 'fi');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fi: { translation: fi },
      sv: { translation: sv },
      en: { translation: en }
    },
    lng: defaultLanguage,
    fallbackLng: 'fi',
    interpolation: {
      escapeValue: false // React already escapes
    }
  });

export default i18n;
