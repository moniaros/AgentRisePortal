import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Policy } from '../../types';

interface RenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy;
  onSubmit: (renewalDetails: { newEndDate: string; newPremium: number }) => void;
}

const RenewalModal: React.FC<RenewalModalProps> = ({ isOpen, onClose, policy, onSubmit }) => {
  const { t } = useLocalization();
  const [newEndDate, setNewEndDate] = useState('');
  const [newPremium, setNewPremium] = useState(policy.premium);

  useEffect(() => {
    if (isOpen) {
        // Default new end date to one year from the current end date
        const currentEndDate = new Date(policy.endDate);
        currentEndDate.setFullYear(currentEndDate.getFullYear() + 1);
        setNewEndDate(currentEndDate.toISOString().split('T')[0]);
        setNewPremium(policy.premium);
    }
  }, [isOpen, policy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ newEndDate, newPremium: Number(newPremium) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">{t('customer.renewPolicyTitle')} for {policy.policyNumber}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="new-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('customer.newEndDate')}
              </label>
              <input
                id="new-end-date"
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
             <div>
              <label htmlFor="new-premium" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('customer.newPremium')}
              </label>
              <input
                id="new-premium"
                type="number"
                step="0.01"
                value={newPremium}
                onChange={(e) => setNewPremium(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
              {t('crm.cancel')}
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {t('crm.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenewalModal;