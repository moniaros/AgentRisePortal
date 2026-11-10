import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { GapAnalysisResult } from '../../types';

interface GapAnalysisResultsProps {
    result: GapAnalysisResult;
}

const RiskGauge: React.FC<{ score: number }> = ({ score }) => {
    const { t } = useLocalization();

    const getColor = (s: number) => {
        if (s < 30) return '#22c55e';
        if (s < 70) return '#eab308';
        return '#ef4444';
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-44 h-24 overflow-hidden">
                <svg viewBox="0 0 100 50" className="absolute top-0 left-0 w-full h-full">
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="10"
                    />
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke={getColor(score)}
                        strokeWidth="10"
                        strokeDasharray={`${(score / 100) * 126} 126`}
                        className="transition-all duration-700 ease-out"
                    />
                </svg>
            </div>
            <div className="-mt-2 text-center tabular-nums">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{score}</span>
                <span className="text-xs text-gray-500 block">/ 100</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('gapAnalysis.riskScore')}
            </p>
            <p className="text-xs text-gray-500">{t('gapAnalysis.riskScoreSubtitle')}</p>
        </div>
    );
};

const GapAnalysisResults: React.FC<GapAnalysisResultsProps> = ({ result }) => {
    const { t } = useLocalization();
    const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
    const [declinedItems, setDeclinedItems] = useState<Record<string, boolean>>({});

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedScriptId(id);
        setTimeout(() => setCopiedScriptId(null), 2000);
    };

    const toggleDeclination = (key: string) => {
        setDeclinedItems((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleExportProposal = () => {
        const lines = [
            'EU IDD INSURANCE COVERAGE ADVISORY & E&O SIGN-OFF RECORD',
            `Generated: ${new Date().toISOString()}`,
            `Risk Exposure Score: ${result.riskScore || 0}/100`,
            '',
            `Executive Summary: ${result.summary}`,
            '',
            '--- IDENTIFIED COVERAGE GAPS & CLIENT DECISIONS ---',
            ...result.gaps.map((gap, idx) => {
                const key = `gap-${idx}`;
                const status = declinedItems[key]
                    ? '[DECLINED BY CLIENT — E&O WAIVER LOGGED]'
                    : '[RECOMMENDED FOR BINDING]';
                return `${idx + 1}. ${gap.area} (${gap.priority || 'High'}) ${status}\n   Current: ${gap.current} -> Recommended: ${gap.recommended}\n   Estimated Premium: ${gap.costOfImplementation || 'Quote Pending'}`;
            }),
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IDD-Gap-Advisory-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const FindingCard: React.FC<{
        type: 'gap' | 'upsell' | 'cross-sell';
        data: any;
        index: number;
    }> = ({ type, data, index }) => {
        const isGap = type === 'gap';
        const itemKey = `${type}-${index}`;
        const isDeclined = Boolean(declinedItems[itemKey]);

        const priorityStyles: Record<string, string> = {
            Critical: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
            High: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
            Medium: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
            Low: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
        };

        return (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden mb-5">
                <div className="p-5 flex justify-between items-start gap-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h4 className="font-semibold text-base text-gray-900 dark:text-white leading-snug">
                            {data.area || data.product}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {data.reason || data.recommendation}
                        </p>
                    </div>
                    {data.priority && (
                        <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border whitespace-nowrap ${
                                priorityStyles[data.priority] || priorityStyles.Low
                            }`}
                        >
                            {t(`gapAnalysis.priority.${data.priority}` as any)}
                        </span>
                    )}
                </div>

                {isGap ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-100 dark:border-gray-700 tabular-nums">
                        <div className="p-4 bg-red-50/40 dark:bg-red-900/10 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700">
                            <span className="block text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                                {t('gapAnalysis.financialImpact')}
                            </span>
                            <span className="block text-base font-bold text-red-700 dark:text-red-300">
                                {data.financialImpact || 'Uninsured Exposure'}
                            </span>
                            {data.costOfInaction && (
                                <span className="block text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                                    {data.costOfInaction}
                                </span>
                            )}
                        </div>
                        <div className="p-4 bg-emerald-50/40 dark:bg-emerald-900/10">
                            <span className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                                {t('gapAnalysis.costOfImplementation')}
                            </span>
                            <span className="block text-base font-bold text-emerald-800 dark:text-emerald-300">
                                {data.costOfImplementation || 'Quote Ready'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-100 dark:border-gray-700 tabular-nums">
                        <div className="p-4 bg-blue-50/30 dark:bg-blue-900/10 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700">
                            <span className="block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                                {t('gapAnalysis.benefit')}
                            </span>
                            <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                                {data.benefit || 'Portfolio Enhancement'}
                            </span>
                        </div>
                        <div className="p-4 bg-emerald-50/30 dark:bg-emerald-900/10">
                            <span className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                                {t('gapAnalysis.estimatedValue')}
                            </span>
                            <span className="block text-base font-bold text-emerald-800 dark:text-emerald-300">
                                {data.costOfImplementation || 'N/A'}
                            </span>
                        </div>
                    </div>
                )}

                {isGap && (
                    <div className="p-4 bg-gray-50/70 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-700 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div className="w-[46%]">
                                <span className="text-[11px] text-gray-500 uppercase font-semibold block mb-0.5">
                                    {t('gapAnalysis.current')}
                                </span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {data.current}
                                </span>
                            </div>
                            <span className="text-gray-400">→</span>
                            <div className="w-[46%] text-right">
                                <span className="text-[11px] text-emerald-600 uppercase font-semibold block mb-0.5">
                                    {t('gapAnalysis.recommended')}
                                </span>
                                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                    {data.recommended}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {data.salesScript && (
                    <div className="p-4 bg-slate-50/80 dark:bg-slate-900/30 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                {t('gapAnalysis.salesScript')}
                            </span>
                            <button
                                onClick={() => handleCopy(data.salesScript, itemKey)}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                                    copiedScriptId === itemKey
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                {copiedScriptId === itemKey
                                    ? t('gapAnalysis.scriptCopied')
                                    : t('gapAnalysis.copyScript')}
                            </button>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            "{data.salesScript}"
                        </div>
                    </div>
                )}

                {/* E&O Client Declination Waiver Toggle */}
                <div className="px-4 py-3 bg-white dark:bg-gray-800 flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isDeclined}
                            onChange={() => toggleDeclination(itemKey)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>
                            Log E&amp;O Client Declination Waiver (EU IDD Compliance Record)
                        </span>
                    </label>
                    {isDeclined && (
                        <span className="font-semibold text-amber-700 dark:text-amber-400">
                            Waiver Recorded
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                    <RiskGauge score={result.riskScore || 0} />
                </div>
                <div className="flex-grow space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Executive Underwriting Summary
                        </h3>
                        <button
                            onClick={handleExportProposal}
                            className="px-3.5 py-1.5 text-xs font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Export Advisory &amp; E&amp;O Sign-Off
                        </button>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        {result.summary}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {t('gapAnalysis.coverageGaps')}
                        </h3>
                        <span className="text-xs font-medium text-gray-500 tabular-nums">
                            {result.gaps.length} findings
                        </span>
                    </div>
                    {result.gaps.length > 0 ? (
                        result.gaps.map((gap, index) => (
                            <FindingCard key={index} type="gap" data={gap} index={index} />
                        ))
                    ) : (
                        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-sm text-gray-500">No critical gaps detected.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t('gapAnalysis.upsellTitle')}
                            </h3>
                            <span className="text-xs font-medium text-gray-500 tabular-nums">
                                {result.upsell_opportunities.length} options
                            </span>
                        </div>
                        {result.upsell_opportunities.length > 0 ? (
                            result.upsell_opportunities.map((opp, index) => (
                                <FindingCard
                                    key={`up-${index}`}
                                    type="upsell"
                                    data={opp}
                                    index={index}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">
                                No immediate policy improvements found.
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t('gapAnalysis.crossSellTitle')}
                            </h3>
                            <span className="text-xs font-medium text-gray-500 tabular-nums">
                                {result.cross_sell_opportunities.length} options
                            </span>
                        </div>
                        {result.cross_sell_opportunities.length > 0 ? (
                            result.cross_sell_opportunities.map((opp, index) => (
                                <FindingCard
                                    key={`cross-${index}`}
                                    type="cross-sell"
                                    data={opp}
                                    index={index}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">
                                No cross-sell opportunities identified.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GapAnalysisResults;
