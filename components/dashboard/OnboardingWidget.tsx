import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../../hooks/useLocalization';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';

const OnboardingWidget: React.FC = () => {
    const { t } = useLocalization();
    const { isCompleted, isSkipped, completeOnboarding } = useOnboardingStatus();

    const handleSkip = (e: React.MouseEvent) => {
        e.preventDefault();
        completeOnboarding();
    };

    if (isCompleted || isSkipped) {
        return null;
    }

    return (
        <div className="bg-blue-600 dark:bg-blue-700 text-white p-6 rounded-lg shadow-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex-grow text-center sm:text-left">
                <h3 className="text-xl font-bold">Welcome to AgentOS!</h3>
                <p className="text-sm text-blue-100 dark:text-blue-200 mt-1 max-w-lg">
                    Let's get you started. Follow our quick onboarding guide to set up your account and launch your first campaign.
                </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-4 mt-4 sm:mt-0">
                <Link
                    to="/onboarding"
                    className="px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-md hover:bg-gray-100 transition shadow"
                >
                    Start Onboarding
                </Link>
                <button 
                    onClick={handleSkip}
                    className="text-sm font-medium text-blue-100 hover:text-white transition"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
};

export default OnboardingWidget;