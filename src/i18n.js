import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fi from './locales/fi.json';
import sv from './locales/sv.json';
import en from './locales/en.json';

// Tarkista URL-parametri ensin
const urlParams = new URLSearchParams(window.location.search);
const urlLang = urlParams.get('lang');

// Hae tallennettu kieli
const savedLanguage = localStorage.getItem('language');

// Oletuskieli on AINA suomi, ellei käyttäjä ole aktiivisesti valinnut toista
// URL-parametri tai tallennettu valinta ohittaa oletuksen
const defaultLanguage = urlLang || savedLanguage || 'fi';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fi: { translation: fi },
      sv: { translation: sv },
      en: { translation: en }
    },
    lng: defaultLanguage,
    fallbackLng: 'fi', // Fallback on aina suomi
    interpolation: {
      escapeValue: false // React already escapes
    }
  });

export default i18n;
