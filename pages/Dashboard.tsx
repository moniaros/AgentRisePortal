import React, { useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useCrmData } from '../hooks/useCrmData';
import { Link } from 'react-router-dom';
import SparklineKpiCard from '../components/dashboard/SparklineKpiCard';
import GaugeKpiCard from '../components/dashboard/GaugeKpiCard';
import ConversionFunnelChart from '../components/dashboard/ConversionFunnelChart';
import ExpiringPoliciesWidget from '../components/dashboard/ExpiringPoliciesWidget';
import TestimonialCarousel from '../components/testimonials/TestimonialCarousel';
import AutomatedTasksWidget from '../components/dashboard/AutomatedTasksWidget';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { AutomatedTask } from '../types';

const Dashboard: React.FC = () => {
    const { t } = useLocalization();
    const { customers, leads, isLoading } = useCrmData();
    const { isCompleted, isSkipped } = useOnboardingStatus();
    
    // This is a placeholder for a real automation service call.
    const automatedTasks: AutomatedTask[] = [
      { id: 'task1', message: 'Sent renewal reminder to Alice Williams for policy #A-123.', createdAt: new Date().toISOString(), type: 'renewal' },
      { id: 'task2', message: 'Payment reminder sent to Bob Brown for policy #L-789.', createdAt: new Date().toISOString(), type: 'payment_reminder' }
    ];

    const kpiData = useMemo(() => {
        if (isLoading || !customers || !leads) {
            return {
                newLeads: { current: 0, previous: 0, trendData: [] },
                policiesSold: { current: 0, previous: 0, trendData: [] },
                conversionRate: { value: 0 },
                expiringPolicies: [],
                funnelData: { leads: 0, quotesIssued: 0, policiesBound: 0 }
            };
        }
        
        const totalPolicies = customers.reduce((acc, c) => acc + c.policies.length, 0);

        // Mock trend data
        const generateMockTrend = (base: number) => [...Array(10)].map((_, i) => ({ date: `Day ${i}`, count: base + Math.floor(Math.random() * base / 2) - base / 4 }));

        return {
            newLeads: { current: leads.filter(l => l.status === 'new').length, previous: 5, trendData: generateMockTrend(8) },
            policiesSold: { current: totalPolicies, previous: 12, trendData: generateMockTrend(15) },
            conversionRate: { value: leads.length > 0 ? Math.round((customers.length / leads.length) * 100) : 0 },
            expiringPolicies: customers.flatMap(c => 
                c.policies
                 .filter(p => {
                    const endDate = new Date(p.endDate);
                    const today = new Date();
                    const diffTime = endDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 30;
                 })
                 .map(p => ({
                     customerId: c.id,
                     customerName: `${c.firstName} ${c.lastName}`,
                     policyNumber: p.policyNumber,
                     endDate: p.endDate
                 }))
            ).sort((a,b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()),
            funnelData: { leads: leads.length, quotesIssued: Math.floor(leads.length * 0.7), policiesBound: customers.length }
        };

    }, [customers, leads, isLoading]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('dashboard.title')}</h1>
            
            {(!isCompleted && !isSkipped) && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg flex items-center justify-between">
                    <p className="text-blue-800 dark:text-blue-200">{t('dashboard.onboardingPrompt')}</p>
                    <Link to="/onboarding" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {t('dashboard.startOnboarding')}
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SparklineKpiCard title={t('dashboard.newLeads')} {...kpiData.newLeads} isLoading={isLoading} />
                <SparklineKpiCard title={t('dashboard.policiesSold')} {...kpiData.policiesSold} isLoading={isLoading} />
                <GaugeKpiCard title={t('dashboard.conversionRate')} value={kpiData.conversionRate.value} isLoading={isLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ConversionFunnelChart data={kpiData.funnelData} isLoading={isLoading} />
                </div>
                <div>
                     <ExpiringPoliciesWidget policies={kpiData.expiringPolicies} isLoading={isLoading} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2">
                    <AutomatedTasksWidget tasks={automatedTasks} isLoading={isLoading} />
                 </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.customerSpotlight')}</h2>
                    <TestimonialCarousel />
                 </div>
            </div>
        </div>
    );
};

export default Dashboard;
