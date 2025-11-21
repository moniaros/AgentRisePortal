
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface CourseSection {
    title: string;
    body: string;
}

interface CourseResource {
    title: string;
    type: 'pdf' | 'template' | 'video';
}

interface CourseData {
    id: string;
    title: string;
    desc: string;
    tag: string;
    duration: string;
    sections: CourseSection[];
    resources?: CourseResource[];
}

interface CourseViewerProps {
    course: CourseData;
    onClose: () => void;
}

const CourseViewer: React.FC<CourseViewerProps> = ({ course, onClose }) => {
    const { t } = useLocalization();
    const [activeSection, setActiveSection] = useState(0);
    const [activeTab, setActiveTab] = useState<'content' | 'resources'>('content');
    const [isCompleted, setIsCompleted] = useState(false);

    const handleNext = () => {
        if (activeSection < course.sections.length - 1) {
            setActiveSection(prev => prev + 1);
            document.getElementById('course-content')?.scrollTo(0, 0);
        } else {
            setIsCompleted(true);
        }
    };

    const getResourceIcon = (type: string) => {
        switch(type) {
            case 'pdf': return '📄';
            case 'template': return '📝';
            case 'video': return '🎥';
            default: return '📎';
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border dark:border-gray-700">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-0.5 text-xs font-bold uppercase bg-blue-600 text-white rounded shadow-sm tracking-wider">
                                {course.tag}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {course.duration}
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{course.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex flex-grow overflow-hidden">
                    {/* Sidebar - Modules */}
                    <div className="w-80 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0 flex flex-col hidden md:flex">
                        <div className="p-6 border-b dark:border-gray-700">
                            <div className="flex space-x-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
                                <button 
                                    onClick={() => setActiveTab('content')}
                                    className={`flex-1 py-1.5 text-sm font-bold rounded-md transition ${activeTab === 'content' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}
                                >
                                    {t('support.academy.modules')}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('resources')}
                                    className={`flex-1 py-1.5 text-sm font-bold rounded-md transition ${activeTab === 'resources' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}
                                >
                                    Resources
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-grow p-4 custom-scrollbar">
                            {activeTab === 'content' ? (
                                <div className="space-y-2">
                                    {course.sections.map((section, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveSection(idx)}
                                            className={`w-full text-left p-4 rounded-xl text-sm font-medium transition-all flex items-start gap-3 group ${
                                                activeSection === idx 
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                                                activeSection === idx ? 'bg-white text-blue-600' : 'bg-gray-100 dark:bg-gray-700'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-grow">
                                                <span className="block leading-snug">{section.title}</span>
                                                <span className={`text-xs mt-1 block ${activeSection === idx ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    {Math.ceil(section.body.length / 300)} min read
                                                </span>
                                            </div>
                                            {idx < activeSection && (
                                                <svg className={`w-5 h-5 ${activeSection === idx ? 'text-blue-200' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {course.resources && course.resources.length > 0 ? (
                                        course.resources.map((res, idx) => (
                                            <a 
                                                key={idx} 
                                                href="#" 
                                                className="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 transition group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{getResourceIcon(res.type)}</span>
                                                    <div>
                                                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm group-hover:text-blue-600">{res.title}</p>
                                                        <p className="text-xs text-gray-500 uppercase mt-1">{res.type}</p>
                                                    </div>
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-4xl mb-2">📂</p>
                                            <p className="text-sm text-gray-500">No additional resources available for this module.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div id="course-content" className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 relative scroll-smooth">
                        <div className="max-w-4xl mx-auto p-8 md:p-12">
                            <span className="inline-block mb-4 text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                                Lesson {activeSection + 1} of {course.sections.length}
                            </span>
                            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight border-b pb-6 dark:border-gray-800">
                                {course.sections[activeSection].title}
                            </h3>
                            
                            <div className="prose dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-gray-300">
                                {course.sections[activeSection].body.split('\n').map((paragraph, i) => {
                                    const cleanParagraph = paragraph.trim();
                                    
                                    // Scripts / Templates
                                    if (cleanParagraph.startsWith('Script:') || cleanParagraph.startsWith('Template:') || cleanParagraph.startsWith('Prompt:')) {
                                        const content = cleanParagraph.replace(/^(Script:|Template:|Prompt:)\s*/i, '');
                                        const label = cleanParagraph.match(/^(Script|Template|Prompt):/i)?.[0] || 'Copy';
                                        
                                        return (
                                            <div key={i} className="my-8 relative group">
                                                <div className="absolute -top-3 left-4 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold uppercase rounded shadow-sm z-10">
                                                    {label.replace(':', '')}
                                                </div>
                                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-l-4 border-blue-600 rounded-r-lg text-slate-800 dark:text-slate-200 font-mono text-sm relative shadow-inner">
                                                    {content}
                                                    <button 
                                                        onClick={() => handleCopy(content)}
                                                        className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition hover:text-blue-600"
                                                        title="Copy to clipboard"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Pro Tips
                                    if (cleanParagraph.startsWith('Pro Tip:') || cleanParagraph.startsWith('Tip:')) {
                                        const content = cleanParagraph.replace(/^(Pro Tip:|Tip:)\s*/i, '');
                                        return (
                                            <div key={i} className="my-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg flex gap-3">
                                                <span className="text-2xl">💡</span>
                                                <div>
                                                    <strong className="block text-yellow-800 dark:text-yellow-200 text-sm uppercase tracking-wide mb-1">Pro Tip</strong>
                                                    <p className="text-yellow-900 dark:text-yellow-100 text-base m-0">{content}</p>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Lists
                                    if (cleanParagraph.startsWith('- ') || cleanParagraph.startsWith('• ')) {
                                        return (
                                            <div key={i} className="flex gap-3 ml-2 mb-3 items-start">
                                                <span className="text-blue-500 mt-1.5 text-xs">●</span>
                                                <span className="leading-7">{cleanParagraph.replace(/^[-•]\s*/, '')}</span>
                                            </div>
                                        )
                                    }
                                    
                                    // Numbered Lists
                                    if (cleanParagraph.match(/^\d+\./)) {
                                         return (
                                            <div key={i} className="flex gap-3 ml-2 mb-3 items-start">
                                                <span className="font-bold text-blue-600 min-w-[1.5rem]">{cleanParagraph.split('.')[0]}.</span>
                                                <span className="leading-7">{cleanParagraph.replace(/^\d+\.\s*/, '')}</span>
                                            </div>
                                        )
                                    }

                                    // Subheaders
                                    if (cleanParagraph.length < 80 && cleanParagraph.endsWith(':') && !cleanParagraph.includes('Script')) {
                                        return <h4 key={i} className="text-xl font-bold mt-10 mb-4 text-gray-900 dark:text-white flex items-center gap-2">{cleanParagraph}</h4>
                                    }

                                    if (!cleanParagraph) return <br key={i} />;

                                    return <p key={i} className="mb-6 leading-8 text-lg">{cleanParagraph}</p>;
                                })}
                            </div>

                            {/* Navigation Footer */}
                            <div className="mt-16 flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-800">
                                <button 
                                    onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                                    disabled={activeSection === 0}
                                    className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition ${
                                        activeSection === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    &larr; Previous Lesson
                                </button>
                                
                                <button 
                                    onClick={handleNext}
                                    className={`px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2 ${
                                        isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <>Course Completed <span className="text-xl">🎓</span></>
                                    ) : (
                                        <>
                                            {activeSection === course.sections.length - 1 ? 'Finish Course' : 'Next Lesson'} 
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 w-full">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out" 
                        style={{ width: `${isCompleted ? 100 : ((activeSection + 1) / course.sections.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default CourseViewer;
