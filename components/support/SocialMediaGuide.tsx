import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { SOCIAL_PLATFORMS } from '../../constants';

const SocialMediaGuide: React.FC = () => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState('linkedin');

    // Manual mapping to match the localized keys structure
    const platforms = [
        { key: 'linkedin', iconKey: 'linkedin', color: 'blue' },
        { key: 'instagram', iconKey: 'instagram', color: 'pink' },
        { key: 'facebook', iconKey: 'facebook', color: 'indigo' },
        { key: 'x', iconKey: 'x', color: 'gray' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 overflow-hidden flex flex-col md:flex-row h-[600px]">
            {/* Sidebar Tabs */}
            <div className="md:w-1/4 bg-gray-50 dark:bg-gray-900/50 border-r dark:border-gray-700 overflow-y-auto">
                <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Modules</h4>
                </div>
                {platforms.map((platform) => {
                    const socialPlatform = SOCIAL_PLATFORMS.find(sp => sp.key === platform.iconKey);
                    const isActive = activeTab === platform.key;
                    return (
                        <button
                            key={platform.key}
                            onClick={() => setActiveTab(platform.key)}
                            className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all border-l-4 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                isActive
                                    ? `border-${platform.color}-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm`
                                    : 'border-transparent text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            <div className={`scale-90 ${isActive ? 'opacity-100' : 'opacity-60'}`}>{socialPlatform?.icon}</div>
                            <span>{socialPlatform?.name}</span>
                            {isActive && <span className="ml-auto text-green-500">●</span>}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="md:w-3/4 p-8 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {t(`support.socialGuide.platforms.${activeTab}.title` as any)}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">Master this channel to establish authority and trust.</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase">Advanced</span>
                </div>
                
                {/* Checklist Section */}
                <div className="mb-8">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                        Optimization Checklist
                    </h4>
                    <div className="space-y-3">
                        {(t(`support.socialGuide.platforms.${activeTab}.checklist` as any) as unknown as string[]).map((item, index) => {
                            const [title, desc] = item.split(':');
                            return (
                                <div key={index} className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition bg-white dark:bg-gray-800 shadow-sm hover:shadow-md">
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                                        <div>
                                            <span className="font-bold text-gray-900 dark:text-white block mb-1 group-hover:text-blue-600 transition">{title}</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Brand Pillars / Pro Tip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                            <span>💡</span> Pro Tip
                        </h4>
                        <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                            Consistency triggers the algorithm. Don't just post once. Aim for at least <strong>3 high-quality posts per week</strong> on this platform to see real growth.
                        </p>
                    </div>
                    
                    <div className="p-5 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <span>🎯</span> Content Focus
                        </h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Educational Snippets</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Client Success Stories</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Community Involvement</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialMediaGuide;