
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export const useLocalization = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LanguageProvider');
  }

  // Helper function to get nested translation values
  const t = (key: string): string => {
    return key.split('.').reduce((acc, currentKey) => {
        if (typeof acc === 'object' && acc !== null && currentKey in acc) {
            return acc[currentKey];
        }
        return key; // Return the key itself if not found
    }, context.translations) as string;
  };

  return { ...context, t };
};
