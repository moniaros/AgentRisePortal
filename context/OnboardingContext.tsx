import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { OnboardingProgress } from '../types';

const ONBOARDING_STORAGE_KEY = 'onboarding_progress';
const ONBOARDING_SKIPPED_KEY = 'onboarding_skipped';

const initialProgress: OnboardingProgress = {
  profileCompleted: false,
  policyAnalyzed: false,
  campaignCreated: false,
};

function checkAutostart(): boolean {
  if (typeof window === 'undefined') return false;
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('autostart') === '1') return true;
  const hashQueryIndex = window.location.hash.indexOf('?');
  if (hashQueryIndex !== -1) {
    const hashParams = new URLSearchParams(window.location.hash.slice(hashQueryIndex));
    if (hashParams.get('autostart') === '1') return true;
  }
  return false;
}

interface OnboardingContextType {
  progress: OnboardingProgress;
  isCompleted: boolean;
  isSkipped: boolean;
  markTaskCompleted: (task: keyof OnboardingProgress) => void;
  completeOnboarding: () => void;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<OnboardingProgress>(() => {
    try {
      const storedProgress = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      return storedProgress ? JSON.parse(storedProgress) : initialProgress;
    } catch {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      return initialProgress;
    }
  });

  const [isSkipped, setIsSkipped] = useState<boolean>(() => {
    if (checkAutostart()) {
      localStorage.setItem(ONBOARDING_SKIPPED_KEY, JSON.stringify(true));
      return true;
    }
    try {
      const storedSkipped = localStorage.getItem(ONBOARDING_SKIPPED_KEY);
      return storedSkipped ? Boolean(JSON.parse(storedSkipped)) : false;
    } catch {
      localStorage.removeItem(ONBOARDING_SKIPPED_KEY);
      return false;
    }
  });

  const markTaskCompleted = useCallback((task: keyof OnboardingProgress) => {
    setProgress((prev) => {
      if (prev[task]) return prev;
      const newProgress = { ...prev, [task]: true };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newProgress));
      return newProgress;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsSkipped(true);
    localStorage.setItem(ONBOARDING_SKIPPED_KEY, JSON.stringify(true));
  }, []);

  const isCompleted = Object.values(progress).every(Boolean);

  const value = { progress, isCompleted, isSkipped, markTaskCompleted, completeOnboarding };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
