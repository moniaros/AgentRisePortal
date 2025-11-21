
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface CourseSection {
    title: string;
    body: string;
}

interface CourseData {
    id: string;
    title: string;
    desc: string;
    tag: string;
    duration: string;
    sections: CourseSection[];
}

interface CourseViewerProps {
    course: CourseData;
    onClose: () => void;
}

const CourseViewer: React.FC<CourseViewerProps> = ({ course, onClose }) => {
    const { t } = useLocalization();
    const [activeSection, setActiveSection] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const progress = Math.round(((activeSection + (isCompleted ? 1 : 0)) / course.sections.length) * 100);

    const handleNext = () => {
        if (activeSection < course.sections.length - 1) {
            setActiveSection(prev => prev + 1);
            // Scroll top of content
            document.getElementById('course-content')?.scrollTo(0, 0);
        } else {
            setIsCompleted(true);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border dark:border-gray-700 animate-fade-in">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 text-xs font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md">
                                {course.tag}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {course.duration}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex flex-grow overflow-hidden">
                    {/* Sidebar - Table of Contents */}
                    <div className="w-1/3 border-r dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900 hidden md:block">
                        <div className="p-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Course Content</h3>
                            <div className="space-y-2">
                                {course.sections.map((section, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveSection(idx)}
                                        className={`w-full text-left p-3 rounded-lg text-sm font-medium transition flex items-center gap-3 ${
                                            activeSection === idx 
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800' 
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                                            activeSection === idx ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        <span className="truncate">{section.title}</span>
                                        {idx < activeSection && (
                                            <svg className="w-4 h-4 text-green-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div id="course-content" className="flex-1 overflow-y-auto p-8 md:p-12 relative bg-white dark:bg-gray-900">
                        <div className="max-w-3xl mx-auto">
                            <span className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-2 block">
                                Module {activeSection + 1} of {course.sections.length}
                            </span>
                            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
                                {course.sections[activeSection].title}
                            </h3>
                            
                            <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                {course.sections[activeSection].body.split('\n').map((paragraph, i) => (
                                    <p key={i} className="mb-4">{paragraph}</p>
                                ))}
                            </div>

                            {/* Navigation Footer inside content */}
                            <div className="mt-12 pt-8 border-t dark:border-gray-700 flex justify-between items-center">
                                <button 
                                    onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                                    disabled={activeSection === 0}
                                    className="text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 font-medium"
                                >
                                    &larr; Previous
                                </button>
                                
                                <button 
                                    onClick={handleNext}
                                    className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition transform hover:-translate-y-0.5 ${
                                        isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {isCompleted ? 'Course Completed 🎓' : (activeSection === course.sections.length - 1 ? 'Finish Course' : 'Next Lesson &rarr;')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-1 bg-gray-100 dark:bg-gray-800 w-full">
                    <div 
                        className="h-full bg-blue-600 transition-all duration-500" 
                        style={{ width: `${isCompleted ? 100 : ((activeSection + 1) / course.sections.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default CourseViewer;
