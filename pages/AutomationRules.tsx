import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAutomationRules } from '../hooks/useAutomationRules';
import { AutomationRule, RuleCategory, UserSystemRole } from '../types';
import { useAuth } from '../hooks/useAuth';

import RulesTable from '../components/automation/RulesTable';
import RulesFilters from '../components/automation/RulesFilters';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import KpiCard from '../components/analytics/KpiCard';

const AutomationRules: React.FC = () => {
    const { t } = useLocalization();
    const { rules, isLoading, error, toggleRuleStatus, deleteRule } = useAutomationRules();
    const { currentUser } = useAuth();
    
    const [activeTab, setActiveTab] = useState<'overview' | RuleCategory>('overview');

    const [filters, setFilters] = useState({
        search: '',
        status: 'all' as 'all' | 'active' | 'inactive',
    });

    const [ruleToDelete, setRuleToDelete] = useState<AutomationRule | null>(null);
    
    const isAdmin = currentUser?.partyRole.roleType === UserSystemRole.ADMIN;

    const overviewData = useMemo(() => {
        const totalRules = rules.length;
        const activeRules = rules.filter(r => r.isEnabled).length;
        const avgSuccessRate = totalRules > 0 ? (rules.reduce((sum, r) => sum + r.successRate, 0) / totalRules) * 100 : 0;
        return { totalRules, activeRules, avgSuccessRate };
    }, [rules]);

    const filteredRules = useMemo(() => {
        const rulesForTab = activeTab === 'overview' ? [] : rules.filter(r => r.category === activeTab);
        
        return rulesForTab.filter(rule => {
            const searchMatch = filters.search === '' || t(rule.nameKey).toLowerCase().includes(filters.search.toLowerCase());
            const statusMatch = filters.status === 'all' || (filters.status === 'active' && rule.isEnabled) || (filters.status === 'inactive' && !rule.isEnabled);
            return searchMatch && statusMatch;
        });
    }, [rules, filters, t, activeTab]);

    const handleDeleteRequest = (rule: AutomationRule) => {
        setRuleToDelete(rule);
    };

    const confirmDelete = () => {
        if (ruleToDelete) {
            deleteRule(ruleToDelete.id);
            setRuleToDelete(null);
        }
    };
    
    if (!isLoading && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    const renderContent = () => {
        if (isLoading) {
            return <SkeletonLoader className="h-96 w-full" />;
        }
        
        if (activeTab === 'overview') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard title={t('automationRules.overview.totalRules')} value={overviewData.totalRules} />
                    <KpiCard title={t('automationRules.overview.activeRules')} value={overviewData.activeRules} />
                    <KpiCard title={t('automationRules.overview.avgSuccessRate')} value={`${overviewData.avgSuccessRate.toFixed(1)}%`} />
                </div>
            );
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
                    onEdit={(rule) => alert(`Editing: ${t(rule.nameKey)}`)}
                    onDuplicate={(rule) => alert(`Duplicating: ${t(rule.nameKey)}`)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('automationRules.title')}</h1>
            
            {error && <ErrorMessage message={error.message} />}

             <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        {t('automationRules.overview.title')}
                    </button>
                    <button onClick={() => setActiveTab('lead_conversion')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'lead_conversion' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        {t('automationRules.categories.lead_conversion')}
                    </button>
                    <button onClick={() => setActiveTab('communication_automation')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'communication_automation' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        {t('automationRules.categories.communication_automation')}
                    </button>
                </nav>
            </div>
            
            {renderContent()}

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