
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { ICONS } from '../constants';

const Onboarding: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-blue-500 mb-4">
                {React.cloneElement(ICONS.onboarding, { className: "h-24 w-24" })}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('nav.onboarding')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                This module is under development. It will guide new agents and customers through the setup process, including documentation, e-signatures, and initial policy configuration.
            </p>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">Future Integrations:</h3>
                <ul className="list-disc list-inside text-left mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <li>DocuSign for e-signatures</li>
                    <li>Social Media API for profile completion</li>
                    <li>Automated welcome email sequences</li>
                </ul>
            </div>
        </div>
    );
};

export default Onboarding;
