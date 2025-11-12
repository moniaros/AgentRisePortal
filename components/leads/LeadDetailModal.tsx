import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Lead } from '../../types';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onConvert?: (lead: Lead) => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ isOpen, onClose, lead, onConvert }) => {
  const { t } = useLocalization();

  if (!isOpen) return null;

  const DetailItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div>
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h4>
      <p className="mt-1 text-sm text-gray-900 dark:text-white">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">{t('leads.leadDetails')}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem label={t('crm.name')} value={`${lead.firstName} ${lead.lastName}`} />
            <DetailItem label={t('crm.form.email')} value={lead.email} />
            <DetailItem label={t('crm.form.phone')} value={lead.phone} />
            <DetailItem label={t('crm.status')} value={t(`statusLabels.${lead.status}`)} />
            <DetailItem label={t('leads.source')} value={lead.source} />
            <DetailItem label={t('leads.policyInterest')} value={t(`policyTypes.${lead.policyType}`)} />
            <DetailItem label={t('crm.potentialValue')} value={`€${lead.potentialValue.toFixed(2)}`} />
            <DetailItem label={t('leads.createdDate')} value={new Date(lead.createdAt).toLocaleString()} />
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
          {onConvert && !lead.customerId && (
            <button type="button" onClick={() => onConvert(lead)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              {t('crm.convert')}
            </button>
          )}
          <button type="button" onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;