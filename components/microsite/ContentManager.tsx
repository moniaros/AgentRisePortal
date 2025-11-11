import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import NewsManager from './content/NewsManager';
import TestimonialsManager from './content/TestimonialsManager';

const ContentManager: React.FC = () => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<'news' | 'testimonials'>('news');

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button 
                        onClick={() => setActiveTab('news')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'news' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        {t('micrositeBuilder.content.manageNews')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('testimonials')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'testimonials' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        {t('micrositeBuilder.content.manageTestimonials')}
                    </button>
                </nav>
            </div>

            <div>
                {activeTab === 'news' && <NewsManager />}
                {activeTab === 'testimonials' && <TestimonialsManager />}
            </div>
        </div>
    );
};

export default ContentManager;
