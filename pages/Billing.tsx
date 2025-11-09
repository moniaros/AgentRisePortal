import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { ICONS } from '../constants';
import { trackBillingAction } from '../services/analytics';

const Billing: React.FC = () => {
    const { t, language } = useLocalization();

    const handlePayClick = () => {
        trackBillingAction('click_pay_disabled', language);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-blue-500 mb-4">
                {React.cloneElement(ICONS.billing, { className: "h-24 w-24" })}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('nav.billing')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                Billing and payments will be managed here. This section is planned for a future release.
            </p>
            <div className="mt-6 p-4 bg-green-50 dark:bg-gray-800 rounded-lg border border-green-200 dark:border-gray-700 max-w-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-300">Placeholder for Stripe Integration:</h3>
                <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                    A component from `@stripe/react-stripe-js` would be rendered here to handle payment processing.
                    This would allow for secure collection of payment details and management of subscriptions or one-time payments for insurance premiums.
                    The backend would need a corresponding Stripe webhook handler to confirm payment success.
                </p>
                <button 
                    onClick={handlePayClick}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400" 
                    disabled
                >
                    Pay with Stripe (Disabled)
                </button>
            </div>
        </div>
    );
};

export default Billing;