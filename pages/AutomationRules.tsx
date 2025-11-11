import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAutomationRules } from '../hooks/useAutomationRules';
import { AutomationRule, RuleCategory, UserSystemRole } from '../types';
import { useAuth } from '../hooks/useAuth';

import RulesTable from '../components/automation/RulesTable';
import RulesFilters from '../components/automation/RulesFilters';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const AutomationRules: React.FC = () => {
    const { t } = useLocalization();
    const { rules, isLoading, error, toggleRuleStatus, deleteRule } = useAutomationRules();
    const { currentUser } = useAuth();

    const [filters, setFilters] = useState({
        search: '',
        category: 'all' as 'all' | RuleCategory,
        status: 'all' as 'all' | 'active' | 'inactive',
    });

    const [ruleToDelete, setRuleToDelete] = useState<AutomationRule | null>(null);

    const filteredRules = useMemo(() => {
        return rules.filter(rule => {
            const searchMatch = filters.search === '' || t(rule.nameKey).toLowerCase().includes(filters.search.toLowerCase());
            const categoryMatch = filters.category === 'all' || rule.category === filters.category;
            const statusMatch = filters.status === 'all' || (filters.status === 'active' && rule.isEnabled) || (filters.status === 'inactive' && !rule.isEnabled);
            return searchMatch && categoryMatch && statusMatch;
        });
    }, [rules, filters, t]);

    const handleDeleteRequest = (rule: AutomationRule) => {
        setRuleToDelete(rule);
    };

    const confirmDelete = () => {
        if (ruleToDelete) {
            deleteRule(ruleToDelete.id);
            setRuleToDelete(null);
        }
    };

    const isAdmin = currentUser?.partyRole.roleType === UserSystemRole.ADMIN;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('automationRules.title')}</h1>
            
            {error && <ErrorMessage message={error.message} />}

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <RulesFilters filters={filters} onFilterChange={setFilters} />
            </div>

            {isLoading ? (
                <SkeletonLoader className="h-96 w-full" />
            ) : (
                <RulesTable
                    rules={filteredRules}
                    isAdmin={isAdmin}
                    onToggleStatus={toggleRuleStatus}
                    onDelete={handleDeleteRequest}
                    onEdit={(rule) => alert(`Editing: ${t(rule.nameKey)}`)}
                    onDuplicate={(rule) => alert(`Duplicating: ${t(rule.nameKey)}`)}
                />
            )}

            {ruleToDelete && (
                <ConfirmationModal
                    isOpen={!!ruleToDelete}
                    onClose={() => setRuleToDelete(null)}
                    onConfirm={confirmDelete}
                    title={t('automationRules.deleteConfirm.title')}
                    confirmText={t('common.delete')}
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                >
                    <p>{t('automationRules.deleteConfirm.message').replace('{ruleName}', t(ruleToDelete.nameKey))}</p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default AutomationRules;
