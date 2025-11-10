import React from 'react';
import { Link } from 'react-router-dom';
import { useNewsData } from '../hooks/useNewsData';
import { useLocalization } from '../hooks/useLocalization';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const Sitemap: React.FC = () => {
    const { t } = useLocalization();
    const { articles, isLoading } = useNewsData();

    const staticPages = [
        { path: '/', label: t('nav.dashboard') },
        { path: '/news', label: t('nav.news') },
        { path: '/testimonials', label: t('nav.testimonials') },
    ];

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-4">{t('sitemap.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('sitemap.intro')}</p>
            
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold border-b pb-2 mb-3">{t('sitemap.pages')}</h2>
                    <ul className="list-disc list-inside space-y-2">
                        {staticPages.map(page => (
                            <li key={page.path}>
                                <Link to={page.path} className="text-blue-500 hover:underline">{page.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div>
                    <h2 className="text-2xl font-semibold border-b pb-2 mb-3">{t('sitemap.newsArticles')}</h2>
                    {isLoading ? (
                        <SkeletonLoader className="h-40 w-full" />
                    ) : (
                        <ul className="list-disc list-inside space-y-2">
                            {articles.map(article => (
                                <li key={article.id}>
                                    <Link to={`/news/${article.id}`} className="text-blue-500 hover:underline">{article.title}</Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sitemap;
