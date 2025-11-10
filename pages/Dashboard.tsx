import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { fetchDashboardData } from '../services/api';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import TestimonialCarousel from '../components/testimonials/TestimonialCarousel';

const Dashboard: React.FC = () => {
    const { t } = useLocalization();
    const { isSkipped, completeOnboarding } = useOnboardingStatus();
    const [data, setData] = useState<{
        newLeadsCount: number;
        monthlyRevenue: number;
        policyDistribution: { name: string; value: number }[];
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
    
    const WelcomeBanner = () => {
        if (isSkipped) return null;

        return (
            <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
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

    const renderStatCard = (title: string, value: string | number, isLoading: boolean) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            {isLoading ? (
                <SkeletonLoader className="h-16 w-3/4" />
            ) : (
                <>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
                </>
            )}
        </div>
    );

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div>
            <WelcomeBanner />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('dashboard.title')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderStatCard(t('dashboard.newLeads'), isLoading ? 0 : data?.newLeadsCount ?? 0, isLoading)}
                {renderStatCard(t('dashboard.monthlyRevenue'), isLoading ? '€0.00' : `€${(data?.monthlyRevenue ?? 0).toLocaleString()}`, isLoading)}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md md:col-span-2 lg:col-span-1">
                     <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.activePolicies')}</h3>
                    {isLoading ? (
                         <SkeletonLoader className="h-16 w-full mt-2" />
                    ) : (
                        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                            {(data?.policyDistribution ?? []).reduce((sum, item) => sum + item.value, 0)}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
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