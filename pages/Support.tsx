
import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import SocialMediaGuide from '../components/support/SocialMediaGuide';
import ProfilePhotoEnhancer from '../components/support/ProfilePhotoEnhancer';
import CourseViewer from '../components/support/CourseViewer';

const Support: React.FC = () => {
    const { t } = useLocalization();
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
    const [activeLevel, setActiveLevel] = useState<'all' | 'foundation' | 'growth' | 'mastery'>('all');

    // Load courses from translation files
    const courses = useMemo(() => {
        const list = [];
        for (let i = 1; i <= 4; i++) {
            const key = `c${i}`;
            // We check if the translation exists to avoid empty cards
            // @ts-ignore
            const title = t(`support.courses.${key}.title`);
            if (title && title !== `support.courses.${key}.title`) {
                // @ts-ignore
                list.push({ id: key, ...t(`support.courses.${key}`) });
            }
        }
        return list;
    }, [t]);

    const filteredCourses = useMemo(() => {
        if (activeLevel === 'all') return courses;
        return courses.filter((course: any) => course.level === activeLevel);
    }, [courses, activeLevel]);

    // Mock Gamification Stats
    const userXP = 350;
    const nextLevelXP = 500;
    const progressPercent = (userXP / nextLevelXP) * 100;
    const currentRank = "Digital Agent"; 

    // Mock Badges
    const badges = [
        { id: 1, icon: '🛡️', name: 'Compliance Guardian', earned: true },
        { id: 2, icon: '🚀', name: 'Launchpad', earned: true },
        { id: 3, icon: '🤝', name: 'Networking Pro', earned: false },
        { id: 4, icon: '👑', name: 'Thought Leader', earned: false },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-8 px-4 sm:px-6 lg:px-8">
            {/* Hero Section & Gamification Dashboard */}
            <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-3xl p-8 text-white shadow-2xl overflow-hidden border border-blue-800">
                <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
                    <svg className="w-64 h-64 transform translate-x-1/4 -translate-y-1/4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/50 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            {t('support.academy.title')}
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight">{t('support.title')}</h1>
                        <p className="text-blue-200 text-lg leading-relaxed max-w-xl">{t('support.academy.subtitle')}</p>
                    </div>

                    {/* Stats & Badges */}
                    <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 w-64 flex-shrink-0">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold uppercase text-blue-200 tracking-wider">{t('support.gamification.rank')}</span>
                                <span className="text-xs font-mono text-blue-200">{userXP} XP</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <span>🏅</span> {currentRank}
                            </h3>
                            <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden mb-2">
                                <div className="bg-gradient-to-r from-blue-400 to-green-400 h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                            <p className="text-[10px] text-right text-blue-300">
                                {Math.round(nextLevelXP - userXP)} XP to {t('support.gamification.nextLevel')}
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 flex-shrink-0 min-w-[200px]">
                            <span className="text-xs font-bold uppercase text-blue-200 tracking-wider mb-3 block">Badges</span>
                            <div className="flex gap-2">
                                {badges.map(badge => (
                                    <div key={badge.id} className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border ${badge.earned ? 'bg-gradient-to-b from-yellow-300 to-yellow-600 border-yellow-200 shadow-lg' : 'bg-gray-700 border-gray-600 opacity-50 grayscale'}`} title={badge.name}>
                                        {badge.icon}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Content Area (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Training Modules Grid */}
                    <div id="courses-grid">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🎓</span>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('support.academy.modules')}</h2>
                            </div>
                            
                            {/* Level Filters */}
                            <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                                {['all', 'foundation', 'growth', 'mastery'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setActiveLevel(level as any)}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${
                                            activeLevel === level 
                                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm' 
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        {level === 'all' ? t('common.all') : t(`support.tabs.${level}` as any)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredCourses.map((course: any) => (
                                <div 
                                    key={course.id} 
                                    onClick={() => setSelectedCourse(course)}
                                    className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 group cursor-pointer flex flex-col h-full relative overflow-hidden"
                                >
                                    {/* Level Stripe */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                        course.level === 'foundation' ? 'bg-blue-400' : 
                                        course.level === 'growth' ? 'bg-purple-500' : 'bg-amber-500'
                                    }`}></div>

                                    <div className="flex justify-between items-start mb-3 pl-3">
                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wide ${
                                            course.level === 'foundation' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                                            course.level === 'growth' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                        }`}>
                                            {course.tag}
                                        </span>
                                        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                            +{course.xp} XP
                                        </span>
                                    </div>
                                    
                                    <h3 className="pl-3 font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition leading-snug">
                                        {course.title}
                                    </h3>
                                    <p className="pl-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">
                                        {course.desc}
                                    </p>
                                    
                                    <div className="pl-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center mt-auto">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {t('support.academy.duration', { minutes: course.duration.replace('m', '') })}
                                        </span>
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                                            {t('support.academy.readArticle')} &rarr;
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Social Guide Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">📚</span>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('support.socialGuide.title')}</h2>
                        </div>
                        <SocialMediaGuide />
                    </div>
                </div>

                {/* Sidebar Tools (1/3) */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🛠️</span>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('support.academy.tools')}</h2>
                        </div>
                        <ProfilePhotoEnhancer />
                    </div>
                    
                    {/* Additional Resource Widget */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg border border-gray-700">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <span>🚀</span> 1-on-1 Coaching
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">Need personalized strategy? Book a session with our top digital sales experts.</p>
                        <button className="w-full py-2 bg-white text-gray-900 font-bold rounded text-sm hover:bg-gray-100 transition">
                            Book Session
                        </button>
                    </div>
                </div>
            </div>

            {/* Course Viewer Modal */}
            {selectedCourse && (
                <CourseViewer 
                    course={selectedCourse} 
                    onClose={() => setSelectedCourse(null)} 
                />
            )}
        </div>
    );
};

export default Support;
