import { useMemo, useCallback, useState, useEffect } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchAutomationRules, fetchTemplates } from '../services/api';
import { AutomationRule, MessageTemplate } from '../types';
import { useAuth } from './useAuth';

export const useAutomationRules = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const [templates, setTemplates] = useState<Record<string, MessageTemplate[]>>({});

    const {
        data: allRules,
        isLoading: isLoadingRules,
        error: errorRules,
        updateData: setAllRules,
    } = useOfflineSync<AutomationRule[]>('automation_rules_data', fetchAutomationRules, []);

    useEffect(() => {
        fetchTemplates().then(setTemplates);
    }, []);

    const rules = useMemo(() => {
        return allRules.filter(rule => rule.agencyId === agencyId);
    }, [allRules, agencyId]);

    const addRule = useCallback((rule: Omit<AutomationRule, 'id' | 'agencyId'>) => {
        if (!agencyId) return;
        const newRule: AutomationRule = {
            ...rule,
            id: `rule_${Date.now()}`,
            agencyId,
        };
        setAllRules([...allRules, newRule]);
    }, [allRules, agencyId, setAllRules]);

    const updateRule = useCallback((updatedRule: AutomationRule) => {
        setAllRules(allRules.map(rule => rule.id === updatedRule.id ? updatedRule : rule));
    }, [allRules, setAllRules]);

    const toggleRuleStatus = useCallback((ruleId: string, isEnabled: boolean) => {
        setAllRules(
            allRules.map(rule =>
                rule.id === ruleId ? { ...rule, isEnabled } : rule
            )
        );
    }, [setAllRules, allRules]);
    
    const deleteRule = useCallback((ruleId: string) => {
        setAllRules(allRules.filter(rule => rule.id !== ruleId));
    }, [setAllRules, allRules]);

    return {
        rules,
        templates,
        isLoading: isLoadingRules,
        error: errorRules,
        addRule,
        updateRule,
        toggleRuleStatus,
        deleteRule,
    };
};