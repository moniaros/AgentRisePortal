import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import SocialMediaGuide from '../components/support/SocialMediaGuide';
import ProfilePhotoEnhancer from '../components/support/ProfilePhotoEnhancer';

const Support: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-8">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-10 text-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
                    <svg className="w-96 h-96 transform translate-x-1/4 -translate-y-1/4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
                <div className="relative z-10 max-w-3xl">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/50 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
                        Enterprise Training Module
                    </span>
                    <h1 className="text-5xl font-extrabold mb-4 leading-tight">{t('support.title')}</h1>
                    <p className="text-xl text-blue-100 mb-8 leading-relaxed">{t('support.description')}</p>
                    <div className="flex flex-wrap gap-4">
                        <button className="px-8 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition shadow-lg flex items-center gap-2">
                            <span>🎓</span> Start Course
                        </button>
                        <button className="px-8 py-3 bg-blue-800/50 backdrop-blur-md text-white font-bold rounded-lg hover:bg-blue-700/50 transition border border-blue-500/30">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Tools */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🛠️</span>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Brand Tools</h2>
                    </div>
                    <ProfilePhotoEnhancer />
                    
                    {/* Bio Generator Placeholder */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-75">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded font-bold">COMING SOON</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Bio Generator</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Drafting a professional bio? Our AI will write your "About Me" section tailored for LinkedIn and your personal site.
                        </p>
                    </div>
                </div>

                {/* Right Column: Curriculum & Knowledge */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📚</span>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Curriculum</h2>
                    </div>
                    
                    <SocialMediaGuide />

                    {/* Quick Links Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition border-l-4 border-blue-500 cursor-pointer">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition">Platform Basics</h3>
                                <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 mb-4">Essential guides to get your agency up and running on AgentOS.</p>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-3/4"></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-right">75% Complete</p>
                        </div>

                        <div className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition border-l-4 border-green-500 cursor-pointer">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-green-600 transition">Sales Mastery</h3>
                                <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 mb-4">Advanced techniques for handling objections and closing deals.</p>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full w-1/3"></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-right">33% Complete</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;