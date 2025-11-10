import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { ICONS } from '../constants';

const Onboarding: React.FC = () => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { progress, isCompleted, completeOnboarding } = useOnboardingStatus();

    const features = [
        // Fix: Removed incorrect type assertion. The `t` function now correctly returns an object.
        { key: 'crm', icon: 'crm', ...t('onboarding.features.crm') },
        // Fix: Removed incorrect type assertion. The `t` function now correctly returns an object.
        { key: 'gapAnalysis', icon: 'gapAnalysis', ...t('onboarding.features.gapAnalysis') },
        // Fix: Removed incorrect type assertion. The `t` function now correctly returns an object.
        { key: 'social', icon: 'socialComposer', ...t('onboarding.features.social') },
    ];

    const checklistItems = [
        { key: 'profileCompleted', text: t('onboarding.checklist.profile'), link: '/profile' },
        { key: 'policyAnalyzed', text: t('onboarding.checklist.policy'), link: '/gap-analysis' },
        { key: 'campaignCreated', text: t('onboarding.checklist.campaign'), link: '/social-composer' },
    ] as const;


    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    {/* FIX: Property 'name' does not exist on type 'User'. Use party.partyName.firstName instead. */}
                    {t('onboarding.title').replace('{name}', currentUser?.party.partyName.firstName || '')}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    {t('onboarding.subtitle')}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
                {features.map(feature => (
                    <div key={feature.key} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                         <div className="text-blue-500 w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-100 dark:bg-gray-700 rounded-full">
                            {React.cloneElement(ICONS[feature.icon as keyof typeof ICONS], { className: "h-8 w-8" })}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.description}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-6">{t('onboarding.checklist.title')}</h2>
                <ul className="space-y-4">
                    {checklistItems.map(item => (
                        <li key={item.key}>
                            <Link to={item.link} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 ${progress[item.key] ? 'bg-green-500 text-white' : 'border-2 border-gray-300'}`}>
                                    {progress[item.key] && '✔'}
                                </div>
                                <span className={`flex-grow ${progress[item.key] ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {item.text}
                                </span>
                                <span className="text-gray-400">&rarr;</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                {isCompleted && (
                    <div className="text-center mt-8 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                        <p className="font-semibold">{t('onboarding.checklist.allDone')}</p>
                    </div>
                )}
                 <div className="text-center mt-8">
                     <Link to="/" onClick={completeOnboarding} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md">
                        {t('onboarding.checklist.getStarted')}
                    </Link>
                 </div>
            </div>
        </div>
    );
};

export default Onboarding;