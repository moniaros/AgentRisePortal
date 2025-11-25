
import React, { useMemo, useState } from 'react';
import { MicrositeTemplate, TemplateCategory, TemplateTier } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { useMicrositeTemplates } from '../../hooks/useMicrositeTemplates';
import { useAuth } from '../../hooks/useAuth';
import SkeletonLoader from '../ui/SkeletonLoader';

interface TemplateSelectorProps {
    onSelect: (template: MicrositeTemplate) => void;
    userTier: TemplateTier;
}

type SortOption = 'popular' | 'newest' | 'recommended';

const TIER_LEVELS: Record<TemplateTier, number> = { free: 0, pro: 1, enterprise: 2 };

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, userTier }) => {
    const { t } = useLocalization();
    const { templates, isLoading, toggleFavorite } = useMicrositeTemplates();
    const { currentUser } = useAuth();
    
    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
    const [selectedTier, setSelectedTier] = useState<'all' | TemplateTier>('all');
    const [sortOption, setSortOption] = useState<SortOption>('recommended');

    const favoriteIds = useMemo(() => new Set(currentUser?.favoriteTemplateIds || []), [currentUser]);

    const categories: (TemplateCategory | 'all')[] = ['all', 'general', 'auto', 'home', 'life', 'business'];

    const filteredTemplates = useMemo(() => {
        if (!templates) return [];
        
        let result = templates.filter(tmpl => {
            const matchesSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  tmpl.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory === 'all' || tmpl.category === selectedCategory;
            const matchesTier = selectedTier === 'all' || tmpl.tier === selectedTier;

            return matchesSearch && matchesCategory && matchesTier;
        });

        // Sorting Logic
        result = result.sort((a, b) => {
            switch (sortOption) {
                case 'popular':
                    // Mock popularity based on tag or arbitrary logic since API doesn't return view counts
                    const aPop = a.tags.includes('popular') ? 1 : 0;
                    const bPop = b.tags.includes('popular') ? 1 : 0;
                    return bPop - aPop;
                case 'newest':
                    // Mock newest based on ID or tag
                    const aNew = a.tags.includes('new') ? 1 : 0;
                    const bNew = b.tags.includes('new') ? 1 : 0;
                    return bNew - aNew;
                case 'recommended':
                default:
                    // Default sort (maybe prioritize unlocked templates)
                    const aLocked = TIER_LEVELS[a.tier] > TIER_LEVELS[userTier];
                    const bLocked = TIER_LEVELS[b.tier] > TIER_LEVELS[userTier];
                    return Number(aLocked) - Number(bLocked);
            }
        });

        return result;
    }, [templates, searchQuery, selectedCategory, selectedTier, sortOption, userTier]);

    const isLocked = (templateTier: TemplateTier) => {
        return TIER_LEVELS[templateTier] > TIER_LEVELS[userTier];
    };

    const handleFavorite = (e: React.MouseEvent, templateId: string) => {
        e.stopPropagation();
        toggleFavorite(templateId);
    };

    if (isLoading) return (
        <div className="space-y-4">
            <SkeletonLoader className="h-10 w-full" />
            <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map(i => <SkeletonLoader key={i} className="h-48 w-full rounded-lg" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Controls Header */}
            <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 sticky top-0 z-10">
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition whitespace-nowrap ${
                                selectedCategory === cat 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Secondary Filters */}
                <div className="flex gap-3 pt-2 border-t dark:border-gray-700">
                    <select 
                        value={selectedTier} 
                        onChange={(e) => setSelectedTier(e.target.value as any)}
                        className="flex-1 text-xs p-2 rounded border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="all">All Tiers</option>
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                    <select 
                        value={sortOption} 
                        onChange={(e) => setSortOption(e.target.value as any)}
                        className="flex-1 text-xs p-2 rounded border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="recommended">Recommended</option>
                        <option value="popular">Most Popular</option>
                        <option value="newest">Newest</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-1">
                {filteredTemplates.map(template => {
                    const locked = isLocked(template.tier);
                    const isFav = favoriteIds.has(template.id);
                    // Mock badges based on logic or random assignment for demo if not in data
                    const isNew = template.tags.includes('new') || Math.random() > 0.8;
                    const isBestSeller = template.tags.includes('popular') || Math.random() > 0.85;
                    
                    return (
                        <div 
                            key={template.id}
                            onClick={() => !locked && onSelect(template)}
                            className={`group flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden border dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 ${
                                locked ? 'opacity-90' : 'cursor-pointer hover:scale-[1.02]'
                            }`}
                        >
                            {/* 16:9 Thumbnail Container */}
                            <div className="relative w-full pt-[56.25%] bg-gray-200 dark:bg-gray-900 overflow-hidden">
                                <img 
                                    src={template.thumbnailUrl} 
                                    alt={template.name} 
                                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${locked ? 'grayscale' : 'group-hover:scale-110'}`}
                                />
                                
                                {/* Gradient Overlay on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    {template.tier === 'pro' && (
                                        <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-extrabold uppercase rounded shadow-sm tracking-wider">
                                            PRO
                                        </span>
                                    )}
                                    {template.tier === 'enterprise' && (
                                        <span className="px-2 py-1 bg-slate-800 text-white text-[10px] font-extrabold uppercase rounded shadow-sm tracking-wider">
                                            ENT
                                        </span>
                                    )}
                                    {isNew && (
                                        <span className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase rounded shadow-sm tracking-wider">
                                            NEW
                                        </span>
                                    )}
                                    {isBestSeller && (
                                        <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold uppercase rounded shadow-sm tracking-wider">
                                            BEST SELLER
                                        </span>
                                    )}
                                </div>

                                {/* Favorite Button */}
                                <button 
                                    onClick={(e) => handleFavorite(e, template.id)}
                                    className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md bg-white/20 hover:bg-white/40 transition ${isFav ? 'text-red-500' : 'text-white'}`}
                                >
                                    <svg className="w-4 h-4" fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                </button>

                                {/* Locked Overlay */}
                                {locked && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                                        <div className="p-3 bg-white/10 rounded-full mb-2">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest">
                                            {template.tier} Plan
                                        </span>
                                        <span className="text-[10px] opacity-80 mt-1">Upgrade to Unlock</span>
                                    </div>
                                )}
                                
                                {/* Preview Action */}
                                {!locked && (
                                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center">
                                        <button className="px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-full shadow-lg hover:bg-gray-100 transition">
                                            Preview Template
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1" title={template.name}>{template.name}</h4>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-3" title={template.description}>
                                    {template.description}
                                </p>
                                <div className="mt-auto flex items-center gap-2">
                                    {template.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded capitalize">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {filteredTemplates.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed dark:border-gray-700">
                        <p className="text-sm text-gray-500">No templates found matching your criteria.</p>
                        <button onClick={() => {setSearchQuery(''); setSelectedCategory('all'); setSelectedTier('all');}} className="mt-2 text-xs text-blue-600 hover:underline">
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateSelector;
