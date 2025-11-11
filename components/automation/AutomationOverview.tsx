import React, { useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useAutomationRules } from '../../hooks/useAutomationRules';
import KpiCard from '../analytics/KpiCard';
import SkeletonLoader from '../ui/SkeletonLoader';
import ErrorMessage from '../ui/ErrorMessage';

const AutomationOverview: React.FC = () => {
    const { t } = useLocalization();
    const { rules, isLoading, error } = useAutomationRules();

    const overviewData = useMemo(() => {
        const totalRules = rules.length;
        const activeRules = rules.filter(r => r.isEnabled).length;
        const avgSuccessRate = totalRules > 0 ? (rules.reduce((sum, r) => sum + r.successRate, 0) / totalRules) * 100 : 0;
        return { totalRules, activeRules, avgSuccessRate };
    }, [rules]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonLoader className="h-24 w-full" />
                <SkeletonLoader className="h-24 w-full" />
                <SkeletonLoader className="h-24 w-full" />
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard title={t('automationRules.overview.totalRules')} value={overviewData.totalRules} />
            <KpiCard title={t('automationRules.overview.activeRules')} value={overviewData.activeRules} />
            <KpiCard title={t('automationRules.overview.avgSuccessRate')} value={`${overviewData.avgSuccessRate.toFixed(1)}%`} />
        </div>
    );
};

export default AutomationOverview;