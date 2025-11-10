import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { fetchDashboardData } from '../services/api';
import SparklineKpiCard from '../components/dashboard/SparklineKpiCard';
import GaugeKpiCard from '../components/dashboard/GaugeKpiCard';
import ConversionFunnelChart from '../components/dashboard/ConversionFunnelChart';
import ExpiringPoliciesWidget from '../components/dashboard/ExpiringPoliciesWidget';
import TestimonialCarousel from '../components/testimonials/TestimonialCarousel';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import KpiCard from '../components/analytics/KpiCard';

type DashboardData = Awaited<ReturnType<typeof fetchDashboardData>>;

const Dashboard: React.FC = () => {
    const { t } = useLocalization();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const dashboardData = await fetchDashboardData();
                setData(dashboardData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.dashboard')}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    [...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-32 w-full" />)
                ) : (
                    <>
                        <KpiCard title={t('dashboard.newLeads')} value={data?.newLeadsCount ?? 0} />
                        <SparklineKpiCard
                            title={t('dashboard.newLeadsThisMonth')}
                            current={data?.newLeadsThisMonth.current ?? 0}
                            previous={data?.newLeadsThisMonth.previous ?? 0}
                            trendData={data?.dailyLeadTrend ?? []}
                            isLoading={isLoading}
                        />
                         <KpiCard title={t('dashboard.totalPolicies')} value={data?.totalPoliciesInForce.current ?? 0} />
                         <GaugeKpiCard title={t('dashboard.onTimeRenewalRate')} value={data?.onTimeRenewalRate ?? 0} isLoading={isLoading} />
                    </>
                )}
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ConversionFunnelChart data={data?.conversionFunnel} isLoading={isLoading} />
                </div>
                <div>
                     <ExpiringPoliciesWidget policies={data?.expiringPolicies ?? []} isLoading={isLoading} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-64">
                    <h2 className="text-xl font-semibold mb-4">{t('dashboard.testimonials')}</h2>
                    <TestimonialCarousel />
                </div>
                 {/* Placeholder for more widgets */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-64">
                    <h2 className="text-xl font-semibold mb-4">{t('dashboard.activityFeed')}</h2>
                    {/* Activity feed component would go here */}
                    <p className="text-sm text-gray-500">{t('common.comingSoon')}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
