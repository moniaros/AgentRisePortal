import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocalization } from '../../hooks/useLocalization';
import { useAutomationRules } from '../../hooks/useAutomationRules';
import { AutomationRule, RuleCategory, UserSystemRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';

import RulesTable from './RulesTable';
import RulesFilters from './RulesFilters';
import ConfirmationModal from '../ui/ConfirmationModal';
import ErrorMessage from '../ui/ErrorMessage';
import SkeletonLoader from '../ui/SkeletonLoader';
import RuleTesterModal from './testing/RuleTesterModal';

const RuleCategoryView: React.FC = () => {
    const { category } = useParams<{ category: RuleCategory }>();
    const navigate = useNavigate();
    const { t } = useLocalization();
    const { rules, isLoading, error, toggleRuleStatus, deleteRule } = useAutomationRules();
    const { currentUser } = useAuth();
    
    const [filters, setFilters] = useState({
        search: '',
        status: 'all' as 'all' | 'active' | 'inactive',
    });
    const [ruleToDelete, setRuleToDelete] = useState<AutomationRule | null>(null);
    const [ruleToTest, setRuleToTest] = useState<AutomationRule | null>(null);
    
    const isAdmin = currentUser?.partyRole.roleType === UserSystemRole.ADMIN;

    const filteredRules = useMemo(() => {
        if (!category) return [];
        const rulesForCategory = rules.filter(r => r.category === category);
        
        return rulesForCategory.filter(rule => {
            const searchMatch = filters.search === '' || rule.name.toLowerCase().includes(filters.search.toLowerCase());
            const statusMatch = filters.status === 'all' || (filters.status === 'active' && rule.isEnabled) || (filters.status === 'inactive' && !rule.isEnabled);
            return searchMatch && statusMatch;
        });
    }, [rules, filters, category]);

    const handleDeleteRequest = (rule: AutomationRule) => {
        setRuleToDelete(rule);
    };

    const confirmDelete = () => {
        if (ruleToDelete) {
            deleteRule(ruleToDelete.id);
            setRuleToDelete(null);
        }
    };
    
    const handleEdit = (rule: AutomationRule) => {
        navigate(`/crm/automation-rules/edit/${rule.id}`);
    };

    if (isLoading) {
        return <SkeletonLoader className="h-96 w-full" />;
    }

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <RulesFilters filters={filters} onFilterChange={setFilters} />
            </div>
            <RulesTable
                rules={filteredRules}
                isAdmin={isAdmin}
                onToggleStatus={toggleRuleStatus}
                onDelete={handleDeleteRequest}
                onEdit={handleEdit}
                onTest={setRuleToTest}
                onDuplicate={(rule) => alert(`Duplicating: ${rule.name}`)}
            />

            {ruleToDelete && (
                <ConfirmationModal
                    isOpen={!!ruleToDelete}
                    onClose={() => setRuleToDelete(null)}
                    onConfirm={confirmDelete}
                    title={t('automationRules.deleteConfirm.title')}
                    confirmText={t('common.delete')}
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                >
                    <p>{t('automationRules.deleteConfirm.message').replace('{ruleName}', ruleToDelete.name)}</p>
                </ConfirmationModal>
            )}

            {ruleToTest && (
                <RuleTesterModal
                    isOpen={!!ruleToTest}
                    onClose={() => setRuleToTest(null)}
                    rule={ruleToTest}
                />
            )}
        </div>
    );
};

export default RuleCategoryView;