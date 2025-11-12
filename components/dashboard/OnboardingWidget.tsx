import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../../hooks/useLocalization';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';

const OnboardingWidget: React.FC = () => {
    const { t } = useLocalization();
    const { progress, isCompleted, isSkipped, markTaskCompleted, completeOnboarding } = useOnboardingStatus();

    const checklistItems = [
        { key: 'profileCompleted', text: t('onboarding.checklist.profile'), link: '/profile' },
        { key: 'policyAnalyzed', text: t('onboarding.checklist.policy'), link: '/gap-analysis' },
        { key: 'campaignCreated', text: t('onboarding.checklist.campaign'), link: '/social-composer' },
    ] as const;

    const handleClose = () => {
        completeOnboarding();
    };

    if (isCompleted || isSkipped) {
        return null;
    }

    return (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-6 rounded-lg shadow-lg mb-6 relative animate-fade-in">
            <button 
                onClick={handleClose}
                className="absolute top-2 right-2 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
                aria-label={t('common.close')}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4">{t('onboarding.checklist.title')}</h3>
            <ul className="space-y-3">
                {checklistItems.map(item => (
                    <li key={item.key}>
                        <Link
                            to={item.link}
                            onClick={() => {
                                markTaskCompleted(item.key);
                                completeOnboarding(); // Mark as skipped to allow navigation
                            }}
                            className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                        >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 border-2 ${progress[item.key] ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-500'}`}>
                                {progress[item.key] && '✔'}
                            </div>
                            <span className={`flex-grow text-sm ${progress[item.key] ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                                {item.text}
                            </span>
                            <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OnboardingWidget;