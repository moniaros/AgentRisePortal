import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Customer, ConsentInfo } from '../../types';
import { isBefore, subMonths, parseISO } from 'date-fns';

interface ConsentManagementProps {
  customer: Customer;
  onUpdateCustomer: (updatedCustomer: Customer) => void;
}

type ConsentType = 'gdpr' | 'marketing';

const isConsentExpired = (dateString: string | null): boolean => {
  if (!dateString) return false;
  try {
    const consentDate = parseISO(dateString);
    const sixMonthsAgo = subMonths(new Date(), 6);
    return isBefore(consentDate, sixMonthsAgo);
  } catch (e) {
    console.error("Invalid date for consent:", dateString, e);
    return false;
  }
};

const ConsentRow: React.FC<{
  type: ConsentType;
  consentInfo: ConsentInfo;
  onUpdate: (type: ConsentType, newInfo: ConsentInfo) => void;
}> = ({ type, consentInfo, onUpdate }) => {
    const { t } = useLocalization();
    const isExpired = isConsentExpired(consentInfo.dateGranted);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newIsGiven = e.target.checked;
        onUpdate(type, { 
            ...consentInfo, 
            isGiven: newIsGiven,
            // If consent is revoked, clear date and channel
            dateGranted: newIsGiven ? (consentInfo.dateGranted || new Date().toISOString().split('T')[0]) : null,
            channel: newIsGiven ? (consentInfo.channel || 'in_person') : null,
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(type, { ...consentInfo, dateGranted: e.target.value });
    };
    
    const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate(type, { ...consentInfo, channel: e.target.value as ConsentInfo['channel'] });
    };

    const labelKey = type === 'gdpr' ? 'gdprConsent' : 'marketingConsent';

    return (
        <div className={`p-4 rounded-md ${isExpired ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
            <div className="flex items-center justify-between">
                <label className="flex items-center font-semibold text-gray-800 dark:text-gray-200">
                    <input
                        type="checkbox"
                        checked={consentInfo.isGiven}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    {t(`customer.consent.${labelKey}`)}
                </label>
            </div>
            {isExpired && (
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 font-semibold">
                    ⚠️ {t('customer.consent.consentExpiredWarning')}
                </p>
            )}
            {consentInfo.isGiven && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pl-8">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t('customer.consent.dateGranted')}</label>
                        <input
                            type="date"
                            value={consentInfo.dateGranted || ''}
                            onChange={handleDateChange}
                            className="mt-1 w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t('customer.consent.channel')}</label>
                        <select
                            value={consentInfo.channel || ''}
                            onChange={handleChannelChange}
                            className="mt-1 w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 capitalize"
                        >
                            <option value="">Select...</option>
                            {Object.entries(t('customer.consent.channelOptions', {})).map(([key, value]) => (
                                <option key={key} value={key}>{value as string}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};


const ConsentManagement: React.FC<ConsentManagementProps> = ({ customer, onUpdateCustomer }) => {
  const { t } = useLocalization();

  const handleUpdate = (type: ConsentType, newInfo: ConsentInfo) => {
    const updatedCustomer = {
      ...customer,
      consent: {
        ...(customer.consent || {
            gdpr: { isGiven: false, dateGranted: null, channel: null },
            marketing: { isGiven: false, dateGranted: null, channel: null },
        }),
        [type]: newInfo,
      },
    };
    onUpdateCustomer(updatedCustomer as Customer);
  };
  
  const consentData = customer.consent || {
    gdpr: { isGiven: false, dateGranted: null, channel: null },
    marketing: { isGiven: false, dateGranted: null, channel: null },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">{t('customer.consent.title')}</h3>
      <div className="space-y-4">
          <ConsentRow type="gdpr" consentInfo={consentData.gdpr} onUpdate={handleUpdate} />
          <ConsentRow type="marketing" consentInfo={consentData.marketing} onUpdate={handleUpdate} />
      </div>
    </div>
  );
};

export default ConsentManagement;
