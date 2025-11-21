
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import SocialMediaGuide from '../components/support/SocialMediaGuide';
import ProfilePhotoEnhancer from '../components/support/ProfilePhotoEnhancer';
import CourseViewer from '../components/support/CourseViewer';

const Support: React.FC = () => {
    const { t } = useLocalization();
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

    const courses = Array.from({ length: 10 }, (_, i) => {
        const key = `c${i + 1}`;
        // @ts-ignore
        return { id: key, ...t(`support.courses.${key}`) };
    });

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-8 px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
                    <svg className="w-64 h-64 sm:w-96 sm:h-96 transform translate-x-1/4 -translate-y-1/4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
                <div className="relative z-10 max-w-3xl">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/50 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
                        Enterprise Training Module
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">{t('support.academy.title')}</h1>
                    <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed">{t('support.academy.subtitle')}</p>
                    <div className="flex flex-wrap gap-4">
                        <button 
                            onClick={() => document.getElementById('courses-grid')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto px-8 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <span>🎓</span> {t('support.academy.startCourse')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Content Area (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Featured Curriculum */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">📚</span>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('support.socialGuide.title')}</h2>
                        </div>
                        <SocialMediaGuide />
                    </div>

                    {/* Training Modules Grid */}
                    <div id="courses-grid">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🎓</span>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('support.academy.modules')}</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {courses.map((course: any) => (
                                <div 
                                    key={course.id} 
                                    onClick={() => setSelectedCourse(course)}
                                    className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase rounded tracking-wide">
                                            {course.tag}
                                        </span>
                                        <span className="text-gray-400 group-hover:text-blue-500 transition">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition leading-snug">{course.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">{course.desc}</p>
                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center mt-auto">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {course.duration}
                                        </span>
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                                            {t('support.academy.readArticle')} 
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Need Personalized Coaching?</h3>
                        <p className="text-sm text-purple-100 mb-4">Book a 1-on-1 session with our top digital sales experts.</p>
                        <button className="w-full py-2 bg-white text-purple-700 font-bold rounded text-sm hover:bg-purple-50 transition">
                            Schedule Session
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
