import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface ConsentManagementProps {
    customerId: string;
}

const ConsentManagement: React.FC<ConsentManagementProps> = ({ customerId }) => {
    const { t } = useLocalization();
    const [consents, setConsents] = useState({
        marketingEmail: true,
        policyRemindersSms: false,
        dataSharing: false,
    });

    const handleToggle = (key: keyof typeof consents) => {
        setConsents(prev => ({ ...prev, [key]: !prev[key] }));
        // In a real app, this would trigger an API call to save the consent.
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4">{t('customer.consent.title')}</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium">{t('customer.consent.marketingEmail.title')}</p>
                        <p className="text-sm text-gray-500">{t('customer.consent.marketingEmail.description')}</p>
                    </div>
                    <input type="checkbox" checked={consents.marketingEmail} onChange={() => handleToggle('marketingEmail')} className="h-5 w-5 rounded" />
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium">{t('customer.consent.policyRemindersSms.title')}</p>
                        <p className="text-sm text-gray-500">{t('customer.consent.policyRemindersSms.description')}</p>
                    </div>
                    <input type="checkbox" checked={consents.policyRemindersSms} onChange={() => handleToggle('policyRemindersSms')} className="h-5 w-5 rounded" />
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium">{t('customer.consent.dataSharing.title')}</p>
                        <p className="text-sm text-gray-500">{t('customer.consent.dataSharing.description')}</p>
                    </div>
                    <input type="checkbox" checked={consents.dataSharing} onChange={() => handleToggle('dataSharing')} className="h-5 w-5 rounded" />
                </div>
            </div>
        </div>
    );
};

export default ConsentManagement;
