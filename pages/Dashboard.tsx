import React, { useMemo, useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useCrmData } from '../hooks/useCrmData';
import { useAuth } from '../hooks/useAuth';
import SparklineKpiCard from '../components/dashboard/SparklineKpiCard';
import GaugeKpiCard from '../components/dashboard/GaugeKpiCard';
import ConversionFunnelChart from '../components/dashboard/ConversionFunnelChart';
import ExpiringPoliciesWidget from '../components/dashboard/ExpiringPoliciesWidget';
import TestimonialCarousel from '../components/testimonials/TestimonialCarousel';
import AutomatedTasksWidget from '../components/dashboard/AutomatedTasksWidget';
import { AutomatedTask, ReminderLogEntry } from '../types';
import { runRenewalChecks } from '../services/renewalAutomation';
import { runPaymentChecks } from '../services/paymentAutomation';
import { MOCK_USERS } from '../data/mockData';

const Dashboard: React.FC = () => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { customers, leads, isLoading } = useCrmData();
    
    // State for automated tasks and logs
    const [tasks, setTasks] = useState<AutomatedTask[]>([]);
    const [renewalLog, setRenewalLog] = useState<ReminderLogEntry[]>([]);
    const [paymentLog, setPaymentLog] = useState<ReminderLogEntry[]>([]);
    const [isTaskLoading, setIsTaskLoading] = useState(true);

    // Effect to run automation checks on component mount (simulating a daily cron job)
    useEffect(() => {
        const runAllChecks = async () => {
            if (!isLoading && customers.length > 0) {
                setIsTaskLoading(true);

                // Run renewal checks
                const { newTasks: renewalTasks, updatedLog: newRenewalLog } = await runRenewalChecks(customers, MOCK_USERS, renewalLog, t(''));
                
                // Run payment checks
                const { newTasks: paymentTasks, updatedLog: newPaymentLog } = await runPaymentChecks(customers, MOCK_USERS, paymentLog, t(''));

                setTasks([...renewalTasks, ...paymentTasks]);
                setRenewalLog(newRenewalLog);
                setPaymentLog(newPaymentLog);

                setIsTaskLoading(false);
            }
        };
        runAllChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, customers]); // Run only when initial data is loaded
    
    const dashboardData = useMemo(() => {
        if (isLoading) return null;
        
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

        const currentMonthLeads = leads.filter(l => new Date(l.createdAt) >= oneMonthAgo);
        const previousMonthLeads = leads.filter(l => new Date(l.createdAt) >= twoMonthsAgo && new Date(l.createdAt) < oneMonthAgo);
        
        const currentMonthPolicies = customers.flatMap(c => c.policies).filter(p => new Date(p.startDate) >= oneMonthAgo).length;
        const previousMonthPolicies = customers.flatMap(c => c.policies).filter(p => new Date(p.startDate) >= twoMonthsAgo && new Date(p.startDate) < oneMonthAgo).length;

        // Generate sparkline trend data for the last 30 days
        const leadsTrend = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateString = date.toISOString().split('T')[0];
            const count = leads.filter(l => l.createdAt.startsWith(dateString)).length;
            return { date: dateString, count };
        });
        
        const policiesTrend = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateString = date.toISOString().split('T')[0];
            const count = customers.flatMap(c => c.policies).filter(p => p.startDate === dateString).length;
            return { date: dateString, count };
        });

        const quotesIssued = leads.filter(l => ['qualified', 'closed', 'rejected'].includes(l.status)).length;
        const policiesBound = leads.filter(l => l.status === 'closed').length;
        const leadToQuoteConversion = leads.length > 0 ? Math.round((quotesIssued / leads.length) * 100) : 0;
        
        const expiringPolicies = customers.flatMap(c => c.policies
            .filter(p => {
                const endDate = new Date(p.endDate);
                const diffTime = endDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return p.isActive && diffDays >= 0 && diffDays <= 30;
            })
            .map(p => ({
                customerId: c.id,
                customerName: `${c.firstName} ${c.lastName}`,
                policyNumber: p.policyNumber,
                endDate: p.endDate
            }))
        ).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

        return {
            leads: { current: currentMonthLeads.length, previous: previousMonthLeads.length, trendData: leadsTrend },
            policies: { current: currentMonthPolicies, previous: previousMonthPolicies, trendData: policiesTrend },
            conversionRate: { value: leadToQuoteConversion },
            funnel: { leads: leads.length, quotesIssued, policiesBound },
            expiringPolicies
        };
    }, [leads, customers, isLoading]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {t('dashboard.welcome').replace('{name}', currentUser?.party.partyName.firstName || '')}
            </h1>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <SparklineKpiCard 
                    title={t('dashboard.newLeads')}
                    current={dashboardData?.leads.current ?? 0}
                    previous={dashboardData?.leads.previous ?? 0}
                    trendData={dashboardData?.leads.trendData ?? []}
                    isLoading={isLoading}
                />
                 <SparklineKpiCard 
                    title={t('dashboard.policiesSold')}
                    current={dashboardData?.policies.current ?? 0}
                    previous={dashboardData?.policies.previous ?? 0}
                    trendData={dashboardData?.policies.trendData ?? []}
                    isLoading={isLoading}
                />
                <GaugeKpiCard 
                    title={t('dashboard.leadToQuote')}
                    value={dashboardData?.conversionRate.value ?? 0}
                    isLoading={isLoading}
                />
            </div>
            
             {/* Main Dashboard Widgets */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                   <ConversionFunnelChart data={dashboardData?.funnel} isLoading={isLoading} />
                </div>
                <div>
                    <ExpiringPoliciesWidget policies={dashboardData?.expiringPolicies ?? []} isLoading={isLoading} />
                </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <AutomatedTasksWidget tasks={tasks} isLoading={isTaskLoading} />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('nav.testimonials')}</h2>
                    <TestimonialCarousel />
                </div>
             </div>

        </div>
    );
};

export default Dashboard;