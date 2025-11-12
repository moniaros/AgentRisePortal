import { useContext } from 'react';
import { OnboardingContext } from '../context/OnboardingContext';

export const useOnboardingStatus = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboardingStatus must be used within an OnboardingProvider');
  }
  return context;
};
