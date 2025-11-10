import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import StatusIndicator from '../components/automation/StatusIndicator';
import ErrorRateChart from '../components/automation/ErrorRateChart';
import FailedRulesTable from '../components/automation/FailedRulesTable';
import ExecutionLogsTable from '../components/automation/ExecutionLogsTable';
import { RuleDefinition, Language } from '../types';

const mockRules: RuleDefinition[] = [
    { id: 'RR-001', trigger: { eventType: 'POLICY_EXPIRING_SOON', parameters: { daysBefore: 30 } }, conditions: [], actions: [{ actionType: 'CREATE_TASK', template: 'Follow up with {customer.firstName} about policy {policy.policyNumber}.' }], isEnabled: true },
    { id: 'PR-001', trigger: { eventType: 'PAYMENT_DUE_SOON', parameters: { daysBefore: 7 } }, conditions: [], actions: [{ actionType: 'SEND_EMAIL', template: 'payment_reminder_7_days' }], isEnabled: true },
    { id: 'PR-002', trigger: { eventType: 'PAYMENT_OVERDUE', parameters: { daysAfter: 3 } }, conditions: [], actions: [{ actionType: 'SEND_SMS', template: 'Your payment for policy {policy.policyNumber} is overdue.' }, {actionType: 'CREATE_TASK', template: 'Call {customer.firstName} about overdue payment for {policy.policyNumber}.'}], isEnabled: false },
];

const AutomationRules: React.FC = () => {
    const { t } = useLocalization();
    const [rules, setRules] = useState(mockRules);

    const toggleRule = (id: string) => {
        setRules(prev => prev.map(rule => rule.id === id ? { ...rule, isEnabled: !rule.isEnabled } : rule));
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.automation')}</h1>
            
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusIndicator lastRun={new Date()} nextRun={new Date(Date.now() + 60 * 60 * 1000)} />
                <ErrorRateChart errorRate={5.2} />
                {/* Placeholder for total executions */}
                 <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Executions (24h)</h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">1,234</p>
                </div>
            </div>

             {/* Failed Rules */}
            <FailedRulesTable />
            
            {/* Rules List */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold">Active Rules</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rule</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {rules.map(rule => (
                                <tr key={rule.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{rule.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{rule.trigger.eventType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{rule.actions.map(a => a.actionType).join(', ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <label htmlFor={`toggle-${rule.id}`} className="flex items-center cursor-pointer">
                                            <div className="relative">
                                                <input type="checkbox" id={`toggle-${rule.id}`} className="sr-only" checked={rule.isEnabled} onChange={() => toggleRule(rule.id)} />
                                                <div className={`block w-14 h-8 rounded-full ${rule.isEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${rule.isEnabled ? 'translate-x-6' : ''}`}></div>
                                            </div>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Execution Logs */}
            <ExecutionLogsTable />
        </div>
    );
};

export default AutomationRules;
