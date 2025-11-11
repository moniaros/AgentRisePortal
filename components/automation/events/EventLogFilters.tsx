import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { AutomationRule, TemplateChannel } from '../../../types';

interface EventLogFiltersProps {
    filters: {
        ruleId: string;
        channel: string;
        dateRange: string;
    };
    onFilterChange: React.Dispatch<React.SetStateAction<any>>;
    allRules: AutomationRule[];
}

const ALL_CHANNELS: TemplateChannel[] = ['email', 'sms', 'viber', 'whatsapp'];

const EventLogFilters: React.FC<EventLogFiltersProps> = ({ filters, onFilterChange, allRules }) => {
    const { t } = useLocalization();

    const handleFilterChange = (key: string, value: string) => {
        onFilterChange((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
                value={filters.ruleId}
                onChange={(e) => handleFilterChange('ruleId', e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
                <option value="all">{t('automationRules.eventLog.filters.allRules')}</option>
                {allRules.map(rule => (
                    <option key={rule.id} value={rule.id}>{rule.name}</option>
                ))}
            </select>
            <select
                value={filters.channel}
                onChange={(e) => handleFilterChange('channel', e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
                <option value="all">{t('automationRules.eventLog.filters.allChannels')}</option>
                {ALL_CHANNELS.map(channel => (
                    <option key={channel} value={channel} className="capitalize">{channel}</option>
                ))}
            </select>
            <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
                <option value="7">{t('automationRules.eventLog.filters.last7Days')}</option>
                <option value="30">{t('automationRules.eventLog.filters.last30Days')}</option>
            </select>
        </div>
    );
};

export default EventLogFilters;