import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@/styles/components/language-switcher.module.css';

const languages = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' }
];

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('preferredLanguage', languageCode);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`${styles.languageButton} ${
            i18n.language === lang.code ? styles.active : ''
          }`}
          aria-label={`Switch to ${lang.label}`}
        >
          <span className={styles.flag}>{lang.flag}</span>
          <span className={styles.label}>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
