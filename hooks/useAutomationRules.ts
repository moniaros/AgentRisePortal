import { useMemo, useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchAutomationRules } from '../services/api';
import { AutomationRule } from '../types';
import { useAuth } from './useAuth';

export const useAutomationRules = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allRules,
        isLoading,
        error,
        updateData: setAllRules,
    } = useOfflineSync<AutomationRule[]>('automation_rules_data', fetchAutomationRules, []);

    const rules = useMemo(() => {
        return allRules.filter(rule => rule.agencyId === agencyId);
    }, [allRules, agencyId]);

    const toggleRuleStatus = useCallback((ruleId: string, isEnabled: boolean) => {
        // FIX: The `updateData` function from `useOfflineSync` expects the new array value directly, not a callback function.
        setAllRules(
            allRules.map(rule =>
                rule.id === ruleId ? { ...rule, isEnabled } : rule
            )
        );
    }, [setAllRules, allRules]);
    
    const deleteRule = useCallback((ruleId: string) => {
        // FIX: The `updateData` function from `useOfflineSync` expects the new array value directly, not a callback function.
        setAllRules(allRules.filter(rule => rule.id !== ruleId));
    }, [setAllRules, allRules]);

    return {
        rules,
        isLoading,
        error,
        toggleRuleStatus,
        deleteRule,
    };
};
