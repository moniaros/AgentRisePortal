import React from 'react';
// FIX: Correct import path
import { Lead } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface LeadsTableProps {
  leads: Lead[];
  onViewDetails: (lead: Lead) => void;
  onConvert?: (lead: Lead) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'qualified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'closed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onViewDetails, onConvert }) => {
  const { t } = useLocalization();

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('crm.name')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('crm.status')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('leads.source')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('crm.potentialValue')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('leads.createdDate')}</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {leads.length > 0 ? leads.map(lead => (
            <tr key={lead.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{lead.firstName} {lead.lastName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                  {t(`statusLabels.${lead.status}`)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.source}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">€{lead.potentialValue.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onViewDetails(lead)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200">
                  {t('leads.viewDetails')}
                </button>
                 {!lead.customerId && onConvert && (
                    <button onClick={() => onConvert(lead)} className="ml-4 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200">
                        {t('crm.convert')}
                    </button>
                )}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">{t('leads.noLeadsFound')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable;