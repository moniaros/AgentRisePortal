
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useExecutiveData } from '../hooks/useExecutiveData';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
// FIX: Import the AgencyGrowthChart component to resolve module error.
import AgencyGrowthChart from '../components/executive/AgencyGrowthChart';
import ProductMixDonutChart from '../components/executive/ProductMixDonutChart';
import ClaimsTrendChart from '../components/executive/ClaimsTrendChart';
import LeadFunnelChart from '../components/executive/LeadFunnelChart';
import CampaignRoiTable from '../components/executive/CampaignRoiTable';
import RiskExposureChart from '../components/executive/RiskExposureChart';

const ExecutiveDashboard: React.FC = () => {
    const { t } = useLocalization();
    const { data, isLoading, error } = useExecutiveData();

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.executiveDashboard') as string}</h1>

            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SkeletonLoader className="h-80 w-full" />
                    <SkeletonLoader className="h-80 w-full" />
                    <SkeletonLoader className="h-80 w-full" />
                    <SkeletonLoader className="h-80 w-full" />
                    <SkeletonLoader className="h-80 w-full lg:col-span-2" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AgencyGrowthChart data={data.agencyGrowth} />
                    <ProductMixDonutChart data={data.productMix} />
                    <ClaimsTrendChart data={data.claimsTrend} />
                    <LeadFunnelChart data={data.leadFunnel} />
                    <div className="lg:col-span-2">
                        <CampaignRoiTable data={data.campaignRoi} />
                    </div>
                    <div className="lg:col-span-2">
                       <RiskExposureChart data={data.riskExposure} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExecutiveDashboard;
