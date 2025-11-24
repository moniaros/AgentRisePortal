
import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { BillingUsage } from '../types';
import CreditUsageCard from '../components/billing/CreditUsageCard';
import { useNotification } from '../hooks/useNotification';

const Billing: React.FC = () => {
    const { t } = useLocalization();
    const { addNotification } = useNotification();
    const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'history'>('overview');

    // Mock data simulating backend response with local state for interactivity
    const [usageData, setUsageData] = useState<BillingUsage>({
        aiCredits: { used: 4500, limit: 5000, percent: 90 },
        seats: { used: 2, limit: 5, percent: 40 },
        storage: { used: 1.2, limit: 10, unit: 'GB', percent: 12 },
        overage: {
            isEnabled: true,
            monthlyBudgetCap: 50.00,
            currentUsageCost: 0
        }
    });

    // Refs to track if alerts have been shown this session to avoid spamming
    const alertsShown = useRef({ approaching: false, limitReached: false });

    // Monitor usage for alerts
    useEffect(() => {
        if (!usageData.overage.isEnabled || usageData.overage.monthlyBudgetCap <= 0) return;

        const percent = (usageData.overage.currentUsageCost / usageData.overage.monthlyBudgetCap) * 100;

        // 100% Threshold
        if (percent >= 100) {
            if (!alertsShown.current.limitReached) {
                addNotification(t('billing.alerts.limitReached'), 'error');
                alertsShown.current.limitReached = true;
                alertsShown.current.approaching = true; // Suppress lower alert if jumping straight to 100
            }
        } 
        // 80% Threshold
        else if (percent >= 80) {
            if (!alertsShown.current.approaching) {
                // Fix: use replacement syntax for percent
                addNotification(t('billing.alerts.approachingLimit', { percent: percent.toFixed(0) }), 'warning');
                alertsShown.current.approaching = true;
            }
        } 
        // Reset if manually cleared (simulated scenario)
        else {
            alertsShown.current = { approaching: false, limitReached: false };
        }
    }, [usageData.overage.currentUsageCost, usageData.overage.monthlyBudgetCap, usageData.overage.isEnabled, t, addNotification]);

    const handleUpdateOverage = (enabled: boolean, cap: number) => {
        setUsageData(prev => ({
            ...prev,
            overage: {
                ...prev.overage,
                isEnabled: enabled,
                monthlyBudgetCap: cap
            }
        }));
    };

    const simulateUsage = () => {
        const costIncrement = 5.00;
        setUsageData(prev => {
            const newCost = prev.overage.currentUsageCost + costIncrement;
            return {
                ...prev,
                overage: {
                    ...prev.overage,
                    currentUsageCost: newCost
                }
            };
        });
        addNotification(t('billing.alerts.usageSimulated', { cost: costIncrement.toFixed(2) }), 'info');
    };

    const plans = [
        {
            id: 'starter',
            name: t('billing.plans.starter.name'),
            price: 0,
            features: ['crm', 'leads', 'support'],
            isCurrent: false,
            isPopular: false
        },
        {
            id: 'pro',
            name: t('billing.plans.pro.name'),
            price: 49,
            features: ['crm', 'leads', 'ai', 'social', 'users', 'support'],
            isCurrent: true,
            isPopular: true
        },
        {
            id: 'enterprise',
            name: t('billing.plans.enterprise.name'),
            price: 199,
            features: ['crm', 'leads', 'ai', 'social', 'users', 'support', 'api', 'custom'],
            isCurrent: false,
            isPopular: false
        }
    ];

    const invoices = [
        { id: 'INV-2024-001', date: '2024-10-01', amount: 49.00, status: 'paid' },
        { id: 'INV-2024-002', date: '2024-09-01', amount: 49.00, status: 'paid' },
        { id: 'INV-2024-003', date: '2024-08-01', amount: 49.00, status: 'paid' },
    ];

    const ProgressBar = ({ percent, colorClass = 'bg-blue-600' }: { percent: number, colorClass?: string }) => (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
            <div className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
        </div>
    );

    const renderOverview = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Current Plan Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col justify-between">
                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">{t('billing.overview.currentPlan')}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{t('billing.plans.pro.name')}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">{t('billing.overview.planActive')}</span>
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{t('billing.plans.pro.desc')}</p>
                </div>
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">{t('billing.overview.renewalDate')}</span>
                        <span className="font-medium text-gray-900 dark:text-white">Nov 1, 2024</span>
                    </div>
                    <button onClick={() => setActiveTab('plans')} className="w-full py-2 mt-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">
                        {t('billing.overview.manageSubscription')}
                    </button>
                </div>
            </div>

            {/* Usage Stats - Including New Credit Usage Card */}
            <CreditUsageCard usage={usageData} onUpdateOverage={handleUpdateOverage} />

            {/* Other Resources Usage */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 lg:col-span-2">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-6">Platform Resources</h3>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span className="text-gray-700 dark:text-gray-200">{t('billing.overview.seats')}</span>
                            <span className="text-gray-500">{usageData.seats.used} / {usageData.seats.limit}</span>
                        </div>
                        <ProgressBar percent={usageData.seats.percent} colorClass="bg-blue-500" />
                    </div>

                    <div>
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span className="text-gray-700 dark:text-gray-200">{t('billing.overview.storage')}</span>
                            <span className="text-gray-500">{usageData.storage.used}{usageData.storage.unit} / {usageData.storage.limit}{usageData.storage.unit}</span>
                        </div>
                        <ProgressBar percent={usageData.storage.percent} colorClass="bg-green-500" />
                    </div>
                </div>
            </div>

            {/* Payment Method (Mock) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 lg:col-span-1">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{t('billing.overview.paymentMethod')}</h3>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                <svg className="w-8 h-5" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="24" rx="4" fill="#1A1F2C"/><path d="M19.5 16.5H16.5V7.5H19.5V16.5Z" fill="white"/><circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2"/><path d="M24 12L28 7.5H24L21.5 12L24 16.5H28L24 12Z" fill="white"/></svg>
                            </div>
                            <div>
                                {/* Fix: Use replacement syntax for translations */}
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('billing.overview.cardEnding', { last4: '4242'})}</p>
                                <p className="text-xs text-gray-500">{t('billing.overview.expires', { date: '12/25'})}</p>
                            </div>
                        </div>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                        {t('billing.overview.updatePayment')}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPlans = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {plans.map((plan) => (
                <div 
                    key={plan.id} 
                    className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all ${
                        plan.isCurrent 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg transform scale-105 z-10' 
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                >
                    {plan.isPopular && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                            Most Popular
                        </div>
                    )}
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">€{plan.price}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('billing.plans.monthly')}</span>
                        </div>
                    </div>
                    
                    <ul className="flex-grow space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                {/* Fix: Handle dynamic replacement for 'users' feature */}
                                {feature === 'users' 
                                    ? t('billing.plans.features.users', { count: plan.id === 'starter' ? 1 : plan.id === 'pro' ? 5 : 'Unlimited' }) 
                                    : t(`billing.plans.features.${feature}` as any)
                                }
                            </li>
                        ))}
                    </ul>

                    <button 
                        className={`w-full py-2 rounded-lg font-semibold transition ${
                            plan.isCurrent 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-default' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        }`}
                        disabled={plan.isCurrent}
                    >
                        {plan.isCurrent ? t('billing.plans.current') : (plan.id === 'enterprise' ? t('billing.plans.contactSales') : t('billing.plans.upgrade'))}
                    </button>
                </div>
            ))}
        </div>
    );

    const renderHistory = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden animate-fade-in">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('billing.history.date')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('billing.history.invoice')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('billing.history.amount')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('billing.history.status')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{inv.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{inv.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">€{inv.amount.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 uppercase">
                                    {t('billing.history.paid')}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-end gap-1 ml-auto">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" /></svg>
                                    {t('common.download')}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {invoices.length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    {t('billing.history.noInvoices')}
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-12 space-y-8 px-4 sm:px-6 lg:px-8">
            {/* Header & Simulation Tool */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('billing.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl">{t('billing.subtitle')}</p>
                </div>
                <button 
                    onClick={simulateUsage}
                    disabled={!usageData.overage.isEnabled || (usageData.overage.currentUsageCost >= usageData.overage.monthlyBudgetCap)}
                    className="px-4 py-2 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 text-xs font-bold rounded-md border border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <span>🧪</span> Test AI Usage (+€5)
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        {t('billing.tabs.overview')}
                    </button>
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'plans'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        {t('billing.tabs.plans')}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'history'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        {t('billing.tabs.history')}
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'plans' && renderPlans()}
                {activeTab === 'history' && renderHistory()}
            </div>
        </div>
    );
};

export default Billing;
