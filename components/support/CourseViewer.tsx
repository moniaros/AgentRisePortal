
import React, { useState, useRef } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface CourseSection {
    title: string;
    body: string;
}

interface CourseQuiz {
    question: string;
    options: string[];
    correctIndex: number;
}

interface CourseData {
    id: string;
    title: string;
    desc: string;
    tag: string;
    duration: string;
    sections: CourseSection[];
    quiz?: CourseQuiz;
    xp: number;
}

interface CourseViewerProps {
    course: CourseData;
    onClose: () => void;
}

const CourseViewer: React.FC<CourseViewerProps> = ({ course, onClose }) => {
    const { t } = useLocalization();
    const [activeSection, setActiveSection] = useState(0);
    const [isQuizMode, setIsQuizMode] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [quizState, setQuizState] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Calculate progress percentage
    const totalSteps = course.sections.length + (course.quiz ? 1 : 0);
    const currentStep = activeSection + (isQuizMode ? 1 : 0) + (quizState === 'correct' ? 1 : 0);
    const progress = Math.min((currentStep / totalSteps) * 100, 100);

    const handleNext = () => {
        if (activeSection < course.sections.length - 1) {
            setActiveSection(prev => prev + 1);
            contentRef.current?.scrollTo(0, 0);
        } else if (course.quiz && !isQuizMode) {
            setIsQuizMode(true);
            contentRef.current?.scrollTo(0, 0);
        } else {
            handleFinish();
        }
    };

    const handleAnswerSubmit = () => {
        if (selectedOption === null || !course.quiz) return;
        
        if (selectedOption === course.quiz.correctIndex) {
            setQuizState('correct');
            // Play success sound or animation logic here
        } else {
            setQuizState('wrong');
        }
    };

    const handleFinish = () => {
        // Here you would typically dispatch an action to add XP to the user profile
        onClose();
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border dark:border-gray-700">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-0.5 text-xs font-bold uppercase bg-blue-600 text-white rounded shadow-sm tracking-wider">
                                {course.tag}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                ⏱ {course.duration}
                            </span>
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                +{course.xp} XP
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{course.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                    {/* Sidebar - Navigation */}
                    <div className="w-full md:w-72 border-b md:border-b-0 md:border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0 flex flex-col">
                        <div className="overflow-y-auto flex-grow p-4 custom-scrollbar hidden md:block">
                            <div className="space-y-2">
                                {course.sections.map((section, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { 
                                            if (!isQuizMode && quizState !== 'correct') {
                                                setActiveSection(idx);
                                            }
                                        }}
                                        className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-all flex items-start gap-3 group ${
                                            activeSection === idx && !isQuizMode && quizState !== 'correct'
                                            ? 'bg-white dark:bg-gray-800 border-l-4 border-blue-600 shadow-sm text-blue-700 dark:text-blue-400' 
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 border border-transparent'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                                            activeSection === idx && !isQuizMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        <span className="line-clamp-2">{section.title}</span>
                                    </button>
                                ))}
                                {course.quiz && (
                                    <div className={`w-full text-left p-3 rounded-lg text-sm font-medium flex items-center gap-3 ${
                                        isQuizMode || quizState === 'correct' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500' : 'text-gray-500'
                                    }`}>
                                        <span className="text-lg">🧠</span>
                                        <span>{t('support.quiz.title') || 'Knowledge Check'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div ref={contentRef} id="course-content" className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 relative scroll-smooth">
                        
                        {/* QUIZ MODE */}
                        {(isQuizMode && course.quiz) ? (
                            <div className="max-w-3xl mx-auto p-8 md:p-12 flex flex-col items-center justify-center min-h-full">
                                {quizState === 'correct' ? (
                                    <div className="text-center animate-fade-in">
                                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto">
                                            <span className="text-5xl">🏆</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('support.gamification.completed')}!</h2>
                                        <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                                            {t('support.quiz.successMessage', {xp: course.xp}) || `You've mastered this module. +${course.xp} XP earned!`}
                                        </p>
                                        <button 
                                            onClick={onClose}
                                            className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg transform hover:-translate-y-1"
                                        >
                                            {t('common.close')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full animate-fade-in">
                                        <span className="text-purple-600 font-bold tracking-widest uppercase text-xs mb-4 block text-center">
                                            {t('support.quiz.title') || 'Knowledge Check'}
                                        </span>
                                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
                                            {course.quiz.question}
                                        </h3>
                                        
                                        <div className="space-y-4 mb-10">
                                            {course.quiz.options.map((option, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => { setSelectedOption(idx); setQuizState('idle'); }}
                                                    className={`w-full p-5 rounded-xl border-2 text-left transition-all flex items-center gap-4 group ${
                                                        selectedOption === idx 
                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md' 
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                                                    }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                        selectedOption === idx ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                        {selectedOption === idx && <span className="text-xs">✓</span>}
                                                    </div>
                                                    <span className={`text-lg ${selectedOption === idx ? 'text-purple-900 dark:text-purple-100 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {option}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        {quizState === 'wrong' && (
                                            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg text-center mb-6 animate-shake">
                                                {t('support.quiz.wrongAnswer') || 'Incorrect. Review the content and try again.'}
                                            </div>
                                        )}

                                        <button 
                                            onClick={handleAnswerSubmit}
                                            disabled={selectedOption === null}
                                            className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {t('support.quiz.submit') || 'Submit Answer'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // LESSON CONTENT MODE
                            <div className="max-w-4xl mx-auto p-6 md:p-12">
                                <div className="mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                                    <span className="inline-block mb-2 text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                        Lesson {activeSection + 1}
                                    </span>
                                    <h3 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                        {course.sections[activeSection].title}
                                    </h3>
                                </div>
                                
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
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
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
                                                        <strong className="block text-yellow-800 dark:text-yellow-200 text-sm uppercase tracking-wide mb-1">Insight</strong>
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
                                        &larr; {t('pagination.previous')}
                                    </button>
                                    
                                    <button 
                                        onClick={handleNext}
                                        className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {(activeSection === course.sections.length - 1 && course.quiz) ? (
                                            <>Start Quiz <span className="text-lg">🧠</span></>
                                        ) : (activeSection === course.sections.length - 1) ? (
                                            <>Complete <span className="text-lg">🏆</span></>
                                        ) : (
                                            <>
                                                {t('pagination.next')} 
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Desktop Progress Bar */}
                <div className="hidden md:block h-1.5 bg-gray-100 dark:bg-gray-800 w-full">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default CourseViewer;
