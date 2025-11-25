import React, { createContext, useState, useEffect, ReactNode } from 'react';
// FIX: Correct import path
import { Language, TranslationTokens } from '../types';
import enTranslations from '../data/locales/en.json';
import elTranslations from '../data/locales/el.json';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: TranslationTokens;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translationsData: { [key in Language]: TranslationTokens } = {
  [Language.EN]: enTranslations as unknown as TranslationTokens,
  [Language.EL]: elTranslations as unknown as TranslationTokens,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang as Language) || Language.EL;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    translations: translationsData[language],
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};