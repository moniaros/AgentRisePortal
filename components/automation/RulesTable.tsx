import React from 'react';
import { AutomationRule } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import CategoryBadge from './CategoryBadge';
import ActionsMenu from './ActionsMenu';
import ToggleSwitch from '../ui/ToggleSwitch';

interface RulesTableProps {
  rules: AutomationRule[];
  isAdmin: boolean;
  onToggleStatus: (ruleId: string, isEnabled: boolean) => void;
  onDelete: (rule: AutomationRule) => void;
  onEdit: (rule: AutomationRule) => void;
  onDuplicate: (rule: AutomationRule) => void;
}

const RulesTable: React.FC<RulesTableProps> = ({ rules, isAdmin, onToggleStatus, onDelete, onEdit, onDuplicate }) => {
  const { t } = useLocalization();

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('automationRules.table.ruleName')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('automationRules.table.category')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('common.status')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('automationRules.table.lastExecuted')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('automationRules.table.successRate')}</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('common.actions')}</span></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {rules.length > 0 ? rules.map(rule => (
            <tr key={rule.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{rule.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{rule.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <CategoryBadge category={rule.category} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ToggleSwitch
                  id={`toggle-${rule.id}`}
                  checked={rule.isEnabled}
                  onChange={(e) => onToggleStatus(rule.id, e.target.checked)}
                  disabled={!isAdmin}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {rule.lastExecuted ? new Date(rule.lastExecuted).toLocaleString() : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {(rule.successRate * 100).toFixed(1)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {isAdmin && (
                  <ActionsMenu
                    onEdit={() => onEdit(rule)}
                    onDuplicate={() => onDuplicate(rule)}
                    onDelete={() => onDelete(rule)}
                  />
                )}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">{t('automationRules.noRules')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RulesTable;