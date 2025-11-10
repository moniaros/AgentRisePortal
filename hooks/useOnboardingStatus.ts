import { useState, useCallback, useEffect } from 'react';
import { OnboardingProgress } from '../types';

const ONBOARDING_STORAGE_KEY = 'onboarding_progress';
const ONBOARDING_SKIPPED_KEY = 'onboarding_skipped';

const initialProgress: OnboardingProgress = {
    profileCompleted: false,
    policyAnalyzed: false,
    campaignCreated: false,
};

export const useOnboardingStatus = () => {
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

    const updateProgress = useCallback((newProgress: OnboardingProgress) => {
        setProgress(newProgress);
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newProgress));
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

    return { progress, isCompleted, isSkipped, markTaskCompleted, completeOnboarding };
};