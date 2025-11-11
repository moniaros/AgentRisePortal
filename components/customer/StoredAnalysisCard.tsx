import React, { useState } from 'react';
import { StoredAnalysis } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import GapAnalysisResults from '../gap-analysis/GapAnalysisResults';

interface StoredAnalysisCardProps {
    analysis: StoredAnalysis;
}

const StoredAnalysisCard: React.FC<StoredAnalysisCardProps> = ({ analysis }) => {
    const { t } = useLocalization();
    const [isExpanded, setIsExpanded] = useState(false);

    const { analysisResult, createdAt, fileName } = analysis;
    const gapCount = analysisResult.gaps.length;
    const upsellCount = analysisResult.upsell_opportunities.length;
    const crossSellCount = analysisResult.cross_sell_opportunities.length;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div>
                    <p className="font-semibold">{t('customer.analysisFor')} <span className="text-blue-500">{fileName}</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('customer.analysisDate', { date: new Date(createdAt).toLocaleString() })}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    {gapCount > 0 && <span className="text-red-500">{gapCount} {t('gapAnalysis.coverageGaps')}</span>}
                    {upsellCount > 0 && <span className="text-blue-500">{upsellCount} {t('gapAnalysis.upsellOpportunities')}</span>}
                    {crossSellCount > 0 && <span className="text-purple-500">{crossSellCount} {t('gapAnalysis.crossSellOpportunities')}</span>}
                    <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                </div>
            </div>
            {isExpanded && (
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <GapAnalysisResults result={analysisResult} />
                </div>
            )}
        </div>
    );
};

export default StoredAnalysisCard;
