import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Language, TranslationTokens } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: TranslationTokens;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang as Language) || Language.EL;
  });

  const [translationsData, setTranslationsData] = useState<{ [key in Language]?: TranslationTokens }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enRes, elRes] = await Promise.all([
          fetch('/data/locales/en.json'),
          fetch('/data/locales/el.json'),
        ]);

        if (!enRes.ok || !elRes.ok) {
          throw new Error('Failed to fetch translation files.');
        }

        const enData = await enRes.json();
        const elData = await elRes.json();

        setTranslationsData({
          [Language.EN]: enData,
          [Language.EL]: elData,
        });
      } catch (err) {
        console.error('Error loading translation files:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while loading translations.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, []);

  const value = {
    language,
    setLanguage,
    translations: translationsData[language] || {},
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
       <div className="flex justify-center items-center h-screen bg-red-100 text-red-700 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};