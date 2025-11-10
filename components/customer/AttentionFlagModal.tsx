import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface AttentionFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  currentReason?: string;
}

const AttentionFlagModal: React.FC<AttentionFlagModalProps> = ({ isOpen, onClose, onSubmit, currentReason }) => {
  const { t } = useLocalization();
  const [reason, setReason] = useState(currentReason || '');

  useEffect(() => {
    if (isOpen) {
      setReason(currentReason || '');
    }
  }, [isOpen, currentReason]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">{t('customer.attentionFlagTitle')}</h2>
          </div>
          <div className="p-6">
            <label htmlFor="attention-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('customer.attentionReason')}
            </label>
            <textarea
              id="attention-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 min-h-[100px]"
              required
              placeholder={t('customer.attentionReasonPlaceholder')}
            />
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
              {t('crm.cancel')}
            </button>
            <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
              {t('crm.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttentionFlagModal;