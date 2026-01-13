import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ko from './locales/ko.json';
import en from './locales/en.json';

const resources = {
  ko: {
    translation: ko
  },
  en: {
    translation: en
  }
};

i18n
  .use(LanguageDetector) // 브라우저 언어 자동 감지
  .use(initReactI18next) // React i18next 초기화
  .init({
    resources,
    lng: 'ko', // 강제 한국어 설정
    fallbackLng: 'ko', // 기본 언어 (감지 실패 시)
    debug: false,

    interpolation: {
      escapeValue: false // React는 XSS를 기본적으로 방어함
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
