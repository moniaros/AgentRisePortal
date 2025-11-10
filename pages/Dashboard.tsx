import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { fetchDashboardData } from '../services/api';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import TestimonialCarousel from '../components/testimonials/TestimonialCarousel';
import SparklineKpiCard from '../components/dashboard/SparklineKpiCard';
import GaugeKpiCard from '../components/dashboard/GaugeKpiCard';

const Dashboard: React.FC = () => {
    const { t, language } = useLocalization();
    const { currentUser } = useAuth();
    const { isSkipped, completeOnboarding } = useOnboardingStatus();

    const [data, setData] = useState<{
        newLeadsCount: number;
        monthlyRevenue: number;
        policyDistribution: { name: string; value: number }[];
        totalPoliciesInForce: { current: number; previous: number; };
        newLeadsThisMonth: { current: number; previous: number; };
        dailyLeadTrend: { date: string; count: number; }[];
        totalPremiumsWritten: { current: number; previous: number; };
        onTimeRenewalRate: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchDashboardData();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) {
            return t('dashboard.greeting.morning');
        } else if (hour < 18) {
            return t('dashboard.greeting.afternoon');
        } else {
            return t('dashboard.greeting.evening');
        }
    };

    const formattedDate = new Date().toLocaleDateString(language, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const agencyMap: { [key: string]: string } = {
        'agency_1': 'Scranton Branch',
        'agency_2': 'Stamford Branch',
    };
    const agencyName = currentUser ? agencyMap[currentUser.agencyId] || 'Default Agency' : '';

    const WelcomeBanner = () => {
        if (isSkipped) return null;

        return (
            <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{t('dashboard.welcomeBanner.title')}</h2>
                    <p className="mt-1 max-w-2xl">{t('dashboard.welcomeBanner.description')}</p>
                </div>
                <div className="flex-shrink-0 flex gap-4">
                    <Link to="/onboarding" className="px-5 py-2 bg-white text-blue-600 font-semibold rounded-md hover:bg-gray-100 transition">
                        {t('dashboard.welcomeBanner.button')}
                    </Link>
                    <button onClick={completeOnboarding} className="text-white hover:underline text-sm">
                        {t('dashboard.welcomeBanner.dismiss')}
                    </button>
                </div>
            </div>
        );
    };

    const renderStatCard = (title: string, value: string | number, isLoadingFlag: boolean) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            {isLoadingFlag ? (
                <SkeletonLoader className="h-24 w-full" />
            ) : (
                <>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
                </>
            )}
        </div>
    );
    
    const KpiCardWithChange: React.FC<{
        title: string;
        current: number;
        previous: number;
        isLoadingFlag: boolean;
        isCurrency?: boolean;
        comparisonText?: string;
    }> = ({ title, current, previous, isLoadingFlag, isCurrency = false, comparisonText }) => {
        if (isLoadingFlag) {
            return (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <SkeletonLoader className="h-24 w-full" />
                </div>
            );
        }

        const change = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
        const isPositive = change >= 0;
        const displayValue = isCurrency
            ? `€${current.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : current.toLocaleString();

        const UpArrow = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>;
        const DownArrow = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{displayValue}</p>
                <div className={`flex items-center text-sm mt-2 font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <UpArrow /> : <DownArrow />}
                    <span className="ml-1">{Math.abs(change).toFixed(1)}%</span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">{comparisonText || t('dashboard.vsLastMonth')}</span>
                </div>
            </div>
        );
    };

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {getGreeting()}, {currentUser?.party.partyName.firstName}!
                    </h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{formattedDate}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.agency')}</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{agencyName}</p>
                    </div>
                </div>
            </header>

            <WelcomeBanner />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderStatCard(t('dashboard.newLeads'), isLoading ? 0 : data?.newLeadsCount ?? 0, isLoading)}
                <SparklineKpiCard
                    title={t('dashboard.newLeadsThisMonth')}
                    current={data?.newLeadsThisMonth.current ?? 0}
                    previous={data?.newLeadsThisMonth.previous ?? 0}
                    trendData={data?.dailyLeadTrend ?? []}
                    isLoading={isLoading}
                />
                <KpiCardWithChange 
                    title={t('dashboard.totalPoliciesInForce')}
                    current={data?.totalPoliciesInForce.current ?? 0}
                    previous={data?.totalPoliciesInForce.previous ?? 0}
                    isLoadingFlag={isLoading}
                />
                {renderStatCard(t('dashboard.monthlyRevenue'), isLoading ? '€0.00' : `€${(data?.monthlyRevenue ?? 0).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isLoading)}
                <KpiCardWithChange
                    title={t('dashboard.totalPremiumsWritten')}
                    current={data?.totalPremiumsWritten.current ?? 0}
                    previous={data?.totalPremiumsWritten.previous ?? 0}
                    isLoadingFlag={isLoading}
                    isCurrency={true}
                    comparisonText={t('dashboard.yoy')}
                />
                <GaugeKpiCard 
                    title={t('dashboard.onTimeRenewalRate')}
                    value={data?.onTimeRenewalRate ?? 0}
                    isLoading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.policyDistribution')}</h2>
                    {isLoading ? (
                        <div className="space-y-4">
                            <SkeletonLoader className="h-8 w-full" />
                            <SkeletonLoader className="h-8 w-3/4" />
                            <SkeletonLoader className="h-8 w-5/6" />
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {data?.policyDistribution.map((policy) => (
                                <li key={policy.name}>
                                    <div className="flex justify-between text-sm">
                                        <span>{t(`policyTypes.${policy.name}`)}</span>
                                        <span>{policy.value}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(policy.value / ((data?.policyDistribution ?? []).reduce((sum, item) => sum + item.value, 1) || 1)) * 100}%` }}></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.testimonialsTitle')}</h2>
                    <TestimonialCarousel />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;