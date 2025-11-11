import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAutomationEvents } from '../hooks/useAutomationEvents';
import { useAutomationRules } from '../hooks/useAutomationRules';
import { AutomationEvent } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import KpiCard from '../components/analytics/KpiCard';
import EventLogFilters from '../components/automation/events/EventLogFilters';
import EventLogTable from '../components/automation/events/EventLogTable';
import ConversionImpactChart from '../components/automation/events/ConversionImpactChart';

const AutomationEventLog: React.FC = () => {
    const { t } = useLocalization();
    const { events, analytics, isLoading, error } = useAutomationEvents();
    const { rules } = useAutomationRules(); // For filter dropdown

    const [filters, setFilters] = useState({
        ruleId: 'all',
        channel: 'all',
        dateRange: '30', // days
    });

    const filteredEvents = useMemo(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(filters.dateRange, 10));

        return events.filter(event => {
            const eventDate = new Date(event.timestamp);
            const dateMatch = eventDate >= startDate && eventDate <= endDate;
            const ruleMatch = filters.ruleId === 'all' || event.ruleId === filters.ruleId;
            const channelMatch = filters.channel === 'all' || event.channel === filters.channel;
            return dateMatch && ruleMatch && channelMatch;
        });
    }, [events, filters]);

    const kpiData = useMemo(() => {
        const totalEvents = filteredEvents.length;
        const successfulEvents = filteredEvents.filter(e => e.status === 'success').length;
        const successRate = totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0;
        const messagesSent = filteredEvents.filter(e => e.channel).length;
        const conversions = filteredEvents.filter(e => e.impact?.includes('status changed')).length;
        return { totalEvents, successRate, messagesSent, conversions };
    }, [filteredEvents]);

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">{t('automationRules.eventLog.title')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">{t('automationRules.eventLog.description')}</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-24 w-full" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title={t('automationRules.eventLog.kpis.totalEvents')} value={kpiData.totalEvents} />
                    <KpiCard title={t('automationRules.eventLog.kpis.successRate')} value={`${kpiData.successRate.toFixed(1)}%`} />
                    <KpiCard title={t('automationRules.eventLog.kpis.messagesSent')} value={kpiData.messagesSent} />
                    <KpiCard title={t('automationRules.eventLog.kpis.conversions')} value={kpiData.conversions} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                   <EventLogFilters 
                        filters={filters}
                        onFilterChange={setFilters}
                        allRules={rules}
                   />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                     {isLoading ? <SkeletonLoader className="h-96 w-full" /> : <EventLogTable events={filteredEvents} />}
                </div>
                <div className="lg:col-span-1">
                     {isLoading ? <SkeletonLoader className="h-96 w-full" /> : <ConversionImpactChart analytics={analytics} />}
                </div>
            </div>
        </div>
    );
};

export default AutomationEventLog;