import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { GapAnalysisResult } from '../../types';

interface GapAnalysisResultsProps {
    result: GapAnalysisResult;
}

const GapAnalysisResults: React.FC<GapAnalysisResultsProps> = ({ result }) => {
    const { t } = useLocalization();

    // FIX: Change component signature to React.FC to correctly handle React's special `key` prop.
    const GapCard: React.FC<{ gap: GapAnalysisResult['gaps'][0] }> = ({ gap }) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="font-bold text-red-800 dark:text-red-300">{gap.area}</h4>
            <div className="flex justify-between items-center text-sm my-2">
                <div className="text-center">
                    <span className="text-xs text-gray-500">{t('gapAnalysis.current')}</span>
                    <p className="font-semibold">{gap.current}</p>
                </div>
                <span className="text-red-500 font-bold text-xl">&rarr;</span>
                <div className="text-center">
                    <span className="text-xs text-gray-500">{t('gapAnalysis.recommended')}</span>
                    <p className="font-semibold">{gap.recommended}</p>
                </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{gap.reason}</p>
        </div>
    );

    // FIX: Change component signature to React.FC to correctly handle React's special `key` prop.
    const OpportunityCard: React.FC<{ opp: GapAnalysisResult['upsell_opportunities'][0], color: 'blue' | 'purple' }> = ({ opp, color }) => {
        const colorClasses = {
            blue: {
                border: 'border-blue-200 dark:border-blue-800',
                text: 'text-blue-800 dark:text-blue-300',
                icon: '💡'
            },
            purple: {
                border: 'border-purple-200 dark:border-purple-800',
                text: 'text-purple-800 dark:text-purple-300',
                icon: '➕'
            }
        };

        return (
            <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg border ${colorClasses[color].border}`}>
                <h4 className={`font-bold ${colorClasses[color].text}`}>
                    <span className="mr-2">{colorClasses[color].icon}</span>
                    {opp.product}
                </h4>
                <p className="text-sm my-2">{opp.recommendation}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong className="font-semibold">Benefit:</strong> {opp.benefit}
                </p>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Gaps */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">{t('gapAnalysis.coverageGaps')}</h3>
                {result.gaps.length > 0 ? (
                    result.gaps.map((gap, index) => <GapCard key={index} gap={gap} />)
                ) : <p className="text-sm text-gray-500">No direct coverage gaps identified based on client needs.</p>}
            </div>

            {/* Column 2: Upsell */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">{t('gapAnalysis.upsellOpportunities')}</h3>
                {result.upsell_opportunities.length > 0 ? (
                    result.upsell_opportunities.map((opp, index) => <OpportunityCard key={index} opp={opp} color="blue" />)
                ) : <p className="text-sm text-gray-500">No specific upsell opportunities found.</p>}
            </div>

            {/* Column 3: Cross-sell */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">{t('gapAnalysis.crossSellOpportunities')}</h3>
                {result.cross_sell_opportunities.length > 0 ? (
                    result.cross_sell_opportunities.map((opp, index) => <OpportunityCard key={index} opp={opp} color="purple" />)
                ) : <p className="text-sm text-gray-500">No specific cross-sell opportunities found.</p>}
            </div>
        </div>
    );
};

export default GapAnalysisResults;