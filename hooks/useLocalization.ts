


import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
// FIX: Correct import path
import { TranslationTokens } from '../types';

export const useLocalization = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LanguageProvider');
  }

  // Helper function to get nested translation values
  const t = (key: string, replacements?: { [key: string]: string | number }): any => {
    const value = key.split('.').reduce((acc: TranslationTokens, currentKey: string): any => {
        if (typeof acc === 'object' && acc !== null && currentKey in acc) {
            return acc[currentKey];
        }
        return key; // Return the key itself if not found
    }, context.translations);

    if (typeof value === 'string' && replacements) {
      let result = value;
      for (const placeholder in replacements) {
        result = result.replace(`{${placeholder}}`, String(replacements[placeholder]));
      }
      return result;
    }

    return value;
  };

  return { ...context, t };
};