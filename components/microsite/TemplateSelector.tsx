
import React, { useMemo, useState } from 'react';
import { MicrositeTemplate, TemplateCategory, TemplateTier } from '../../types';
import { MICROSITE_TEMPLATES } from '../../data/micrositeTemplates';
import { useLocalization } from '../../hooks/useLocalization';

interface TemplateSelectorProps {
    onSelect: (template: MicrositeTemplate) => void;
    userTier: TemplateTier;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, userTier }) => {
    const { t } = useLocalization();
    const [filter, setFilter] = useState<TemplateCategory | 'all'>('all');

    const filteredTemplates = useMemo(() => {
        if (filter === 'all') return MICROSITE_TEMPLATES;
        return MICROSITE_TEMPLATES.filter(tmpl => tmpl.category === filter);
    }, [filter]);

    const isLocked = (tier: TemplateTier) => {
        if (userTier === 'enterprise') return false;
        if (userTier === 'pro' && tier !== 'enterprise') return false;
        if (userTier === 'free' && tier === 'free') return false;
        return true;
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['all', 'general', 'auto', 'home', 'business'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat as any)}
                        className={`px-3 py-1 text-xs rounded-full border transition whitespace-nowrap ${
                            filter === cat 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredTemplates.map(template => {
                    const locked = isLocked(template.tier);
                    return (
                        <div 
                            key={template.id}
                            onClick={() => !locked && onSelect(template)}
                            className={`group relative rounded-lg overflow-hidden border dark:border-gray-700 shadow-sm transition-all ${
                                locked ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:ring-2 hover:ring-blue-500 hover:shadow-md'
                            }`}
                        >
                            {/* Thumbnail */}
                            <div className="h-32 bg-gray-200 relative">
                                <img 
                                    src={template.thumbnailUrl} 
                                    alt={template.name} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    {template.tier === 'pro' && (
                                        <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold uppercase rounded shadow-sm">
                                            PRO
                                        </span>
                                    )}
                                </div>
                                {locked && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            Upgrade to Unlock
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3 bg-white dark:bg-gray-800">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{template.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{template.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TemplateSelector;
