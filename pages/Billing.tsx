import React, { useState, useEffect, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { BillingUsage } from '../types';
import CreditUsageCard from '../components/billing/CreditUsageCard';
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../hooks/useAuth';

interface ServerInvoice {
    id: string;
    mydataMark?: string;
    date: string;
    planName?: string;
    netAmount?: number;
    vatAmount?: number;
    amount: number;
    status: 'paid' | 'issued';
}

type PlanId = 'starter' | 'pro' | 'enterprise';

const Billing: React.FC = () => {
    const { t } = useLocalization();
    const { addNotification } = useNotification();
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'history'>('overview');

    const [currentPlanId, setCurrentPlanId] = useState<PlanId>('pro');
    const [usageData, setUsageData] = useState<BillingUsage>({
        aiCredits: { used: 4500, limit: 5000, percent: 90 },
        seats: { used: 2, limit: 5, percent: 40 },
        storage: { used: 1.4, limit: 10, unit: 'GB', percent: 14 },
        overage: {
            isEnabled: true,
            monthlyBudgetCap: 50.0,
            currentUsageCost: 0,
        },
    });
    const [invoices, setInvoices] = useState<ServerInvoice[]>([
        {
            id: 'INV-2026-1101',
            mydataMark: '400001928374651',
            date: '2026-11-01',
            planName: 'Pro Agency',
            netAmount: 39.52,
            vatAmount: 9.48,
            amount: 49.0,
            status: 'paid',
        },
    ]);

    const getAuthHeaders = (): Record<string, string> => {
        const token = sessionStorage.getItem('agentos_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const applyServerBillingState = useCallback((data: any) => {
        if (!data || !data.aiCredits) return;
        if (data.planId) setCurrentPlanId(data.planId);
        setUsageData({
            aiCredits: data.aiCredits,
            seats: data.seats,
            storage: data.storage,
            overage: data.overage,
        });
        if (Array.isArray(data.invoices)) {
            setInvoices(data.invoices);
        }
        window.dispatchEvent(new CustomEvent('agentos:credits-updated', { detail: data }));
    }, []);

    const fetchBillingState = useCallback(async () => {
        try {
            const agencyParam = currentUser?.agencyId || 'agency_1';
            const resp = await fetch(
                `/api/billing/usage?agencyId=${encodeURIComponent(agencyParam)}`,
                { headers: getAuthHeaders() }
            );
            if (resp.ok) {
                const payload = await resp.json();
                applyServerBillingState(payload);
            }
        } catch {
            // Keep resilient local state if offline
        }
    }, [currentUser?.agencyId, applyServerBillingState]);

    useEffect(() => {
        fetchBillingState();
    }, [fetchBillingState]);

    const handleUpdateOverage = async (enabled: boolean, cap: number) => {
        try {
            const resp = await fetch('/api/billing/overage', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    agencyId: currentUser?.agencyId || 'agency_1',
                    isEnabled: enabled,
                    monthlyBudgetCap: cap,
                }),
            });
            if (resp.ok) {
                const updated = await resp.json();
                applyServerBillingState(updated);
                addNotification(
                    `Flex-Budget cap updated (${enabled ? `€${cap.toFixed(2)}/mo` : 'Disabled'})`,
                    'success'
                );
                return;
            }
        } catch {
            // Fallback below
        }
        setUsageData((prev) => ({
            ...prev,
            overage: { ...prev.overage, isEnabled: enabled, monthlyBudgetCap: cap },
        }));
    };

    const handleSelectPlan = async (planId: PlanId) => {
        if (planId === currentPlanId) return;
        try {
            const resp = await fetch('/api/billing/plan', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    agencyId: currentUser?.agencyId || 'agency_1',
                    planId,
                }),
            });
            if (resp.ok) {
                const updated = await resp.json();
                applyServerBillingState(updated);
                addNotification(`Switched agency subscription to ${planId.toUpperCase()} tier`, 'success');
            }
        } catch {
            setCurrentPlanId(planId);
        }
    };

    const simulateUsage = async () => {
        try {
            const resp = await fetch('/api/billing/simulate', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    agencyId: currentUser?.agencyId || 'agency_1',
                    credits: 500,
                }),
            });
            const payload = await resp.json();
            if (!resp.ok) {
                addNotification(payload.error || t('billing.alerts.limitReached'), 'error');
                if (payload.state) applyServerBillingState(payload.state);
                return;
            }
            applyServerBillingState(payload.state);
            if (payload.warningLevel === 'limit_reached') {
                addNotification(t('billing.alerts.limitReached'), 'error');
            } else if (payload.warningLevel === 'approaching_80') {
                addNotification(t('billing.alerts.approachingLimit', { percent: '80' }), 'warning');
            } else {
                addNotification(
                    `Consumed 500 AI Credits (€${Number(payload.overageEuroCharged || 0).toFixed(2)} overage)`,
                    'info'
                );
            }
        } catch {
            addNotification('Unable to reach server billing ledger.', 'error');
        }
    };

    const handleDownloadInvoice = (inv: ServerInvoice) => {
        const net = inv.netAmount ?? Number((inv.amount / 1.24).toFixed(2));
        const vat = inv.vatAmount ?? Number((inv.amount - net).toFixed(2));
        const doc = [
            '====================================================',
            'AGENTOS INSURTECH SA — OFFICIAL GREEK TAX INVOICE',
            'AADE myDATA ELECTRONIC BOOKS COMPLIANT RECEIPT',
            '====================================================',
            `Invoice ID    : ${inv.id}`,
            `myDATA MARK   : ${inv.mydataMark || '400001928374651'}`,
            `Issue Date    : ${inv.date}`,
            `Plan Tier     : ${inv.planName || currentPlanId.toUpperCase()}`,
            '----------------------------------------------------',
            `Net Amount    : EUR ${net.toFixed(2)}`,
            `VAT (24%)     : EUR ${vat.toFixed(2)}`,
            `Total Paid    : EUR ${inv.amount.toFixed(2)}`,
            `Status        : ${inv.status.toUpperCase()}`,
            '====================================================',
        ].join('\n');

        const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${inv.id}-myDATA.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const plans: {
        id: PlanId;
        name: string;
        price: number;
        credits: number;
        features: string[];
        isPopular?: boolean;
    }[] = [
        {
            id: 'starter',
            name: t('billing.plans.starter.name') as string,
            price: 0,
            credits: 1000,
            features: ['crm', 'leads', 'support'],
        },
        {
            id: 'pro',
            name: t('billing.plans.pro.name') as string,
            price: 49,
            credits: 5000,
            features: ['crm', 'leads', 'ai', 'social', 'users', 'support'],
            isPopular: true,
        },
        {
            id: 'enterprise',
            name: t('billing.plans.enterprise.name') as string,
            price: 199,
            credits: 25000,
            features: ['crm', 'leads', 'ai', 'social', 'users', 'support', 'api', 'custom'],
        },
    ];

    const ProgressBar = ({
        percent,
        colorClass = 'bg-blue-600',
    }: {
        percent: number;
        colorClass?: string;
    }) => (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
            <div
                className={`${colorClass} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(100, percent)}%` }}
            />
        </div>
    );

    const renderOverview = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                        {t('billing.overview.currentPlan')}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                            {currentPlanId === 'pro'
                                ? (t('billing.plans.pro.name') as string)
                                : currentPlanId}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-semibold rounded-md uppercase">
                            {t('billing.overview.planActive')}
                        </span>
                    </div>
                    <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                        {t('billing.plans.pro.desc')}
                    </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 tabular-nums">
                    <div className="flex justify-between text-xs mb-3">
                        <span className="text-gray-500">Included Monthly AI Credits</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {usageData.aiCredits.limit.toLocaleString()} credits
                        </span>
                    </div>
                    <button
                        onClick={() => setActiveTab('plans')}
                        className="w-full py-2 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                        {t('billing.overview.manageSubscription')}
                    </button>
                </div>
            </div>

            <CreditUsageCard usage={usageData} onUpdateOverage={handleUpdateOverage} />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2 tabular-nums">
                <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-5">
                    Workspace Seat &amp; Vault Quotas
                </h3>
                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span className="text-gray-700 dark:text-gray-200">
                                {t('billing.overview.seats')}
                            </span>
                            <span className="text-gray-500">
                                {usageData.seats.used} / {usageData.seats.limit}
                            </span>
                        </div>
                        <ProgressBar percent={usageData.seats.percent} colorClass="bg-blue-600" />
                    </div>

                    <div>
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span className="text-gray-700 dark:text-gray-200">
                                {t('billing.overview.storage')}
                            </span>
                            <span className="text-gray-500">
                                {usageData.storage.used}
                                {usageData.storage.unit} / {usageData.storage.limit}
                                {usageData.storage.unit}
                            </span>
                        </div>
                        <ProgressBar
                            percent={usageData.storage.percent}
                            colorClass="bg-emerald-600"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            {t('billing.overview.paymentMethod')}
                        </h3>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                            {t('billing.overview.cardEnding', { last4: '4242' })}
                        </p>
                        <p className="text-xs text-gray-500 tabular-nums mt-0.5">
                            {t('billing.overview.expires', { date: '12/28' })} • AADE myDATA Auto-Transmit
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPlans = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
                const isCurrent = plan.id === currentPlanId;
                return (
                    <div
                        key={plan.id}
                        className={`relative flex flex-col p-6 rounded-xl border transition-all ${
                            isCurrent
                                ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-900/15 shadow-sm'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                    >
                        <div className="mb-4 tabular-nums">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {plan.name}
                                </h3>
                                {plan.isPopular && (
                                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-semibold">
                                        Recommended
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                    €{plan.price}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                    {t('billing.plans.monthly')}
                                </span>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                                Includes {plan.credits.toLocaleString()} AI Credits / mo
                            </p>
                        </div>

                        <ul className="flex-grow space-y-2.5 mb-6">
                            {plan.features.map((feature, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                                >
                                    <span className="text-emerald-600 font-bold">✓</span>
                                    {feature === 'users'
                                        ? t('billing.plans.features.users', {
                                              count:
                                                  plan.id === 'starter'
                                                      ? 1
                                                      : plan.id === 'pro'
                                                      ? 5
                                                      : 'Unlimited',
                                          })
                                        : t(`billing.plans.features.${feature}` as any)}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSelectPlan(plan.id)}
                            disabled={isCurrent}
                            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                isCurrent
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-default'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {isCurrent ? t('billing.plans.current') : `Switch to ${plan.name}`}
                        </button>
                    </div>
                );
            })}
        </div>
    );

    const renderHistory = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm tabular-nums">
                    <thead className="bg-gray-50 dark:bg-gray-900/40 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <tr>
                            <th className="px-6 py-3 text-left">{t('billing.history.date')}</th>
                            <th className="px-6 py-3 text-left">{t('billing.history.invoice')}</th>
                            <th className="px-6 py-3 text-left">AADE myDATA MARK</th>
                            <th className="px-6 py-3 text-right">Net + 24% VAT</th>
                            <th className="px-6 py-3 text-right">{t('billing.history.amount')}</th>
                            <th className="px-6 py-3 text-left">{t('billing.history.status')}</th>
                            <th className="px-6 py-3 text-right">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {invoices.map((inv) => {
                            const net = inv.netAmount ?? Number((inv.amount / 1.24).toFixed(2));
                            const vat = inv.vatAmount ?? Number((inv.amount - net).toFixed(2));
                            return (
                                <tr
                                    key={inv.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                                        {inv.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-mono text-xs">
                                        {inv.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                                        {inv.mydataMark || '400001928374651'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-500">
                                        €{net.toFixed(2)} + €{vat.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900 dark:text-white">
                                        €{inv.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 uppercase">
                                            {t('billing.history.paid')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleDownloadInvoice(inv)}
                                            className="text-blue-600 hover:underline dark:text-blue-400 text-xs font-semibold"
                                        >
                                            {t('common.download')}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-12 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {t('billing.title')}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Server-enforced AI credit metering, Flex-Budget caps, and Greek AADE myDATA e-invoicing.
                    </p>
                </div>
                <button
                    onClick={simulateUsage}
                    className="px-3.5 py-2 bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200 text-xs font-semibold rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors tabular-nums"
                >
                    Simulate +500 AI Credits
                </button>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {(['overview', 'plans', 'history'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            {t(`billing.tabs.${tab}` as any)}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'plans' && renderPlans()}
                {activeTab === 'history' && renderHistory()}
            </div>
        </div>
    );
};

export default Billing;
