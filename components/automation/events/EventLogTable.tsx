import React from 'react';
import { AutomationEvent } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface EventLogTableProps {
  events: AutomationEvent[];
}

const getStatusColor = (status: 'success' | 'failure') => {
  switch (status) {
    case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'failure': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const EventLogTable: React.FC<EventLogTableProps> = ({ events }) => {
  const { t } = useLocalization();

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto h-full">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('automationRules.eventLog.table.timestamp')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('automationRules.eventLog.table.rule')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('automationRules.eventLog.table.status')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('automationRules.eventLog.table.details')}</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {events.length > 0 ? events.map(event => (
            <tr key={event.id}>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{new Date(event.timestamp).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{event.ruleName}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.status)}`}>
                  {t(`statusLabels.${event.status}`)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <p>{event.details}</p>
                {event.impact && <p className="text-xs text-blue-500">{event.impact}</p>}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={4} className="text-center py-16 text-gray-500 dark:text-gray-400">{t('automationRules.eventLog.noEvents')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EventLogTable;