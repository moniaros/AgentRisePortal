
import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';

export type CampaignObjective = 'awareness' | 'traffic' | 'leads' | 'engagement';

export interface CampaignStrategy {
    objective: CampaignObjective;
    audience: string;
    keyMessage: string;
}

interface CampaignBriefProps {
    strategy: CampaignStrategy;
    onChange: (newStrategy: CampaignStrategy) => void;
    isGenerating: boolean;
}

const CampaignBrief: React.FC<CampaignBriefProps> = ({ strategy, onChange, isGenerating }) => {
    const { t } = useLocalization();

    const handleChange = (field: keyof CampaignStrategy, value: string) => {
        onChange({ ...strategy, [field]: value });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">1. Campaign Strategy</h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Marketing Objective</label>
                    <select
                        value={strategy.objective}
                        onChange={(e) => handleChange('objective', e.target.value as CampaignObjective)}
                        className="w-full p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                        disabled={isGenerating}
                    >
                        <option value="awareness">Brand Awareness (Reach)</option>
                        <option value="traffic">Drive Traffic (Clicks)</option>
                        <option value="leads">Lead Generation (Signups)</option>
                        <option value="engagement">Community Engagement (Comments)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
                    <input
                        type="text"
                        value={strategy.audience}
                        onChange={(e) => handleChange('audience', e.target.value)}
                        placeholder="e.g., New Parents, Small Business Owners"
                        className="w-full p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                        disabled={isGenerating}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Key Message / Topic</label>
                    <textarea
                        value={strategy.keyMessage}
                        onChange={(e) => handleChange('keyMessage', e.target.value)}
                        placeholder="e.g., Life insurance protects your family's future..."
                        rows={2}
                        className="w-full p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 resize-none"
                        disabled={isGenerating}
                    />
                </div>
            </div>
        </div>
    );
};

export default CampaignBrief;
