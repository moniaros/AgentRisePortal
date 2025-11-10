import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface CampaignRoiTableProps {
    data: { id: string; name: string; spend: number; revenue: number }[];
}

const CampaignRoiTable: React.FC<CampaignRoiTableProps> = ({ data }) => {
    const { t } = useLocalization();

    const calculateRoi = (spend: number, revenue: number) => {
        if (spend === 0) return 'N/A';
        const roi = ((revenue - spend) / spend) * 100;
        return `${roi.toFixed(1)}%`;
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">{t('executive.campaignRoi')}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('campaigns.name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('analytics.kpis.totalSpend')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('executive.revenueGenerated')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('executive.roi')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {data.map(campaign => (
                            <tr key={campaign.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{campaign.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">€{campaign.spend.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">€{campaign.revenue.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{calculateRoi(campaign.spend, campaign.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CampaignRoiTable;
