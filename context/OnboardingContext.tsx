import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { OnboardingProgress } from '../types';

const ONBOARDING_STORAGE_KEY = 'onboarding_progress';
const ONBOARDING_SKIPPED_KEY = 'onboarding_skipped';

const initialProgress: OnboardingProgress = {
    profileCompleted: false,
    policyAnalyzed: false,
    campaignCreated: false,
};

interface OnboardingContextType {
    progress: OnboardingProgress;
    isCompleted: boolean;
    isSkipped: boolean;
    markTaskCompleted: (task: keyof OnboardingProgress) => void;
    completeOnboarding: () => void;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [progress, setProgress] = useState<OnboardingProgress>(initialProgress);
    const [isSkipped, setIsSkipped] = useState(false);

    useEffect(() => {
        try {
            const storedProgress = localStorage.getItem(ONBOARDING_STORAGE_KEY);
            if (storedProgress) {
                setProgress(JSON.parse(storedProgress));
            }
            const storedSkipped = localStorage.getItem(ONBOARDING_SKIPPED_KEY);
            if (storedSkipped) {
                setIsSkipped(JSON.parse(storedSkipped));
            }
        } catch (error) {
            console.error("Failed to parse onboarding status from localStorage", error);
            localStorage.removeItem(ONBOARDING_STORAGE_KEY);
            localStorage.removeItem(ONBOARDING_SKIPPED_KEY);
        }
    }, []);

    const markTaskCompleted = useCallback((task: keyof OnboardingProgress) => {
        setProgress(prev => {
            if (prev[task]) return prev; // Avoid unnecessary updates
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

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
};
