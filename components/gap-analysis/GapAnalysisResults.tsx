
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { GapAnalysisResult } from '../../types';

interface GapAnalysisResultsProps {
    result: GapAnalysisResult;
}

const RiskGauge: React.FC<{ score: number }> = ({ score }) => {
    const { t } = useLocalization();
    // Calculate rotation for semi-circle (0 to 180 degrees)
    
    const getColor = (s: number) => {
        if (s < 30) return '#22c55e'; // Green
        if (s < 70) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-24 overflow-hidden">
                 {/* SVG Implementation for better control */}
                 <svg viewBox="0 0 100 50" className="absolute top-0 left-0 w-full h-full">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <path 
                        d="M 10 50 A 40 40 0 0 1 90 50" 
                        fill="none" 
                        stroke={getColor(score)} 
                        strokeWidth="10" 
                        strokeDasharray={`${(score / 100) * 126} 126`} // 126 is approx length of the arc
                        className="transition-all duration-1000 ease-out"
                    />
                 </svg>
            </div>
            <div className="-mt-2 text-center">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{score}</span>
                <span className="text-sm text-gray-500 block">/ 100</span>
            </div>
            <p className="mt-2 font-semibold text-gray-700 dark:text-gray-300">{t('gapAnalysis.riskScore')}</p>
            <p className="text-xs text-gray-500">{t('gapAnalysis.riskScoreSubtitle')}</p>
        </div>
    );
};

const GapAnalysisResults: React.FC<GapAnalysisResultsProps> = ({ result }) => {
    const { t } = useLocalization();
    const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedScriptId(id);
        setTimeout(() => setCopiedScriptId(null), 2000);
    };

    const FindingCard: React.FC<{ 
        type: 'gap' | 'upsell' | 'cross-sell';
        data: any;
        index: number;
    }> = ({ type, data, index }) => {
        const isGap = type === 'gap';
        const borderColor = isGap ? 'border-red-500' : type === 'upsell' ? 'border-blue-500' : 'border-purple-500';
        const bgColor = isGap ? 'bg-red-50 dark:bg-red-900/10' : 'bg-white dark:bg-gray-800';
        const priorityColors: Record<string, string> = {
            'Critical': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
            'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
            'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
            'Low': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };

        return (
            <div className={`p-5 rounded-lg border-l-4 shadow-sm mb-4 ${borderColor} ${bgColor} dark:border-opacity-50`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                            {data.area || data.product}
                        </h4>
                        {data.priority && (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${priorityColors[data.priority] || 'bg-gray-200 text-gray-700'}`}>
                                {t(`gapAnalysis.priority.${data.priority}` as any)}
                            </span>
                        )}
                    </div>
                    {data.financialImpact && (
                        <div className="text-right">
                            <span className="block text-xs font-semibold text-gray-500 uppercase">{t('gapAnalysis.financialImpact')}</span>
                            <span className="block font-bold text-red-600 dark:text-red-400">{data.financialImpact}</span>
                        </div>
                    )}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                    {data.reason || data.recommendation}
                </p>

                {isGap && (
                    <div className="flex gap-4 text-sm mb-4 p-3 bg-white dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
                        <div>
                            <span className="text-xs text-gray-500 uppercase block">{t('gapAnalysis.current')}</span>
                            <span className="font-semibold">{data.current}</span>
                        </div>
                        <div className="text-gray-400">→</div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase block">{t('gapAnalysis.recommended')}</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">{data.recommended}</span>
                        </div>
                    </div>
                )}

                {data.salesScript && (
                    <div className="mt-4">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                                💬 {t('gapAnalysis.salesScript')}
                            </span>
                            <button 
                                onClick={() => handleCopy(data.salesScript, `${type}-${index}`)}
                                className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                            >
                                {copiedScriptId === `${type}-${index}` ? (
                                    <span className="text-green-600 font-bold">{t('gapAnalysis.scriptCopied')}</span>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                        {t('gapAnalysis.copyScript')}
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md text-sm italic text-gray-700 dark:text-gray-300 font-serif">
                            "{data.salesScript}"
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Executive Summary Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                    <RiskGauge score={result.riskScore || 0} />
                </div>
                <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Executive Summary</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        {result.summary}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Col: Gaps */}
                <div>
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                        ⚠️ {t('gapAnalysis.coverageGaps')}
                    </h3>
                    {result.gaps.length > 0 ? (
                        result.gaps.map((gap, index) => <FindingCard key={index} type="gap" data={gap} index={index} />)
                    ) : (
                        <p className="text-gray-500 italic">No critical gaps detected.</p>
                    )}
                </div>

                {/* Right Col: Opportunities */}
                <div>
                    <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                        🚀 Growth Opportunities
                    </h3>
                    {result.upsell_opportunities.map((opp, index) => (
                        <FindingCard key={`up-${index}`} type="upsell" data={opp} index={index} />
                    ))}
                    {result.cross_sell_opportunities.map((opp, index) => (
                        <FindingCard key={`cross-${index}`} type="cross-sell" data={opp} index={index} />
                    ))}
                    {result.upsell_opportunities.length === 0 && result.cross_sell_opportunities.length === 0 && (
                        <p className="text-gray-500 italic">No immediate opportunities identified.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GapAnalysisResults;
