
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { GapAnalysisResult } from '../../types';

interface GapAnalysisResultsProps {
    result: GapAnalysisResult;
}

const RiskGauge: React.FC<{ score: number }> = ({ score }) => {
    const { t } = useLocalization();
    
    const getColor = (s: number) => {
        if (s < 30) return '#22c55e'; // Green
        if (s < 70) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-24 overflow-hidden">
                 <svg viewBox="0 0 100 50" className="absolute top-0 left-0 w-full h-full">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <path 
                        d="M 10 50 A 40 40 0 0 1 90 50" 
                        fill="none" 
                        stroke={getColor(score)} 
                        strokeWidth="10" 
                        strokeDasharray={`${(score / 100) * 126} 126`} 
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
            'Critical': 'bg-red-600 text-white',
            'High': 'bg-orange-500 text-white',
            'Medium': 'bg-yellow-500 text-white',
            'Low': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };

        const Icon = () => {
            if (type === 'gap') return <span className="text-red-500 text-xl">⚠️</span>;
            if (type === 'upsell') return <span className="text-blue-500 text-xl">💡</span>;
            if (type === 'cross-sell') return <span className="text-purple-500 text-xl">➕</span>;
            return null;
        };

        return (
            <div className={`rounded-lg shadow-md border-t-4 ${borderColor} ${bgColor} dark:border-opacity-50 overflow-hidden mb-6 transition-all hover:shadow-lg`}>
                {/* Header */}
                <div className="p-5 flex justify-between items-start border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                        <Icon />
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                                {data.area || data.product}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {data.reason || data.recommendation}
                            </p>
                        </div>
                    </div>
                    {data.priority && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${priorityColors[data.priority] || 'bg-gray-200'}`}>
                            {t(`gapAnalysis.priority.${data.priority}` as any)}
                        </span>
                    )}
                </div>

                {/* Impact Analysis / Value Proposition */}
                <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <div className="p-4 text-center">
                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('gapAnalysis.financialImpact')}</span>
                        <span className="block text-lg sm:text-xl font-extrabold text-red-600 dark:text-red-400">{data.financialImpact || 'N/A'}</span>
                        {data.costOfInaction && (
                            <span className="block text-[10px] text-gray-500 mt-1 leading-tight px-2">{data.costOfInaction}</span>
                        )}
                    </div>
                    <div className="p-4 text-center relative">
                        <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold text-gray-400">VS</div>
                        
                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('gapAnalysis.costOfImplementation')}</span>
                        <span className="block text-lg sm:text-xl font-extrabold text-green-600 dark:text-green-400">{data.costOfImplementation || 'TBD'}</span>
                    </div>
                </div>

                {isGap && (
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between text-sm">
                            <div className="w-[45%]">
                                <span className="text-xs text-gray-500 uppercase block font-semibold mb-1">{t('gapAnalysis.current')}</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{data.current}</span>
                            </div>
                            <div className="text-gray-300">→</div>
                            <div className="w-[45%] text-right">
                                <span className="text-xs text-gray-500 uppercase block font-semibold mb-1">{t('gapAnalysis.recommended')}</span>
                                <span className="font-medium text-green-700 dark:text-green-300">{data.recommended}</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {!isGap && data.benefit && (
                     <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-center">
                        <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                            ✨ {data.benefit}
                        </span>
                    </div>
                )}

                {/* Sales Script Section */}
                {data.salesScript && (
                    <div className="p-5 bg-blue-50 dark:bg-blue-900/10">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
                                💬 {t('gapAnalysis.salesScript')}
                            </span>
                        </div>
                        <div className="relative group">
                            <div className="p-4 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800 rounded-lg text-sm italic text-gray-700 dark:text-gray-300 font-serif leading-relaxed shadow-sm">
                                "{data.salesScript}"
                            </div>
                            <button 
                                onClick={() => handleCopy(data.salesScript, `${type}-${index}`)}
                                className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-md transition-all transform active:scale-95 flex items-center gap-1 opacity-90 hover:opacity-100"
                            >
                                {copiedScriptId === `${type}-${index}` ? (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        {t('gapAnalysis.scriptCopied')}
                                    </span>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                        {t('gapAnalysis.copyScript')}
                                    </>
                                )}
                            </button>
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
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-red-100 dark:border-red-900">
                        <span className="text-2xl">⚠️</span>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {t('gapAnalysis.coverageGaps')}
                        </h3>
                    </div>
                    {result.gaps.length > 0 ? (
                        result.gaps.map((gap, index) => <FindingCard key={index} type="gap" data={gap} index={index} />)
                    ) : (
                        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500">No critical gaps detected.</p>
                        </div>
                    )}
                </div>

                {/* Right Col: Opportunities (Split) */}
                <div className="space-y-8">
                    {/* Upsells */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-100 dark:border-blue-900">
                            <span className="text-2xl">💡</span>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                {t('gapAnalysis.upsellTitle')}
                            </h3>
                        </div>
                        {result.upsell_opportunities.length > 0 ? (
                            result.upsell_opportunities.map((opp, index) => (
                                <FindingCard key={`up-${index}`} type="upsell" data={opp} index={index} />
                            ))
                        ) : (
                            <p className="text-gray-500 italic text-sm pl-4">No immediate policy improvements found.</p>
                        )}
                    </div>

                    {/* Cross-sells */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-purple-100 dark:border-purple-900">
                            <span className="text-2xl">➕</span>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                {t('gapAnalysis.crossSellTitle')}
                            </h3>
                        </div>
                        {result.cross_sell_opportunities.length > 0 ? (
                            result.cross_sell_opportunities.map((opp, index) => (
                                <FindingCard key={`cross-${index}`} type="cross-sell" data={opp} index={index} />
                            ))
                        ) : (
                            <p className="text-gray-500 italic text-sm pl-4">No cross-sell opportunities identified.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GapAnalysisResults;