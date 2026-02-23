import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import es from './es.json';

const browserLanguage = navigator.language.toLowerCase();
const initialLanguage = browserLanguage.startsWith('en') ? 'en' : 'es';

i18n.use(initReactI18next).init({
    resources: {
        en: {
            translation: en,
        },
        es: {
            translation: es,
        },
    },
    lng: localStorage.getItem('language') || initialLanguage,
    fallbackLng: 'es',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
