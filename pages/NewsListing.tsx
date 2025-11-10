import React, { useEffect } from 'react';
import { useNewsData } from '../hooks/useNewsData';
import { useLocalization } from '../hooks/useLocalization';
import ArticleCard from '../components/news/ArticleCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';

const NewsListing: React.FC = () => {
    const { t } = useLocalization();
    const { articles, isLoading, error } = useNewsData();

    useEffect(() => {
        const title = t('news.title');
        document.title = `${title} | AgentOS`;
    
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', `Stay updated with the latest news and announcements from your insurance agency. ${title}`);
    
        return () => {
            document.title = 'Aσφαλιστική Πύλη | Insurance Portal';
            if (metaDescription) {
                metaDescription.setAttribute('content', 'A comprehensive lead generation and management platform for insurance professionals.');
            }
        };
    }, [t]);

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('news.title')}</h1>
            
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => <SkeletonLoader key={i} className="h-96 w-full rounded-lg" />)}
                </div>
            ) : articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()).map(article => <ArticleCard key={article.id} article={article} />)}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">{t('news.noArticles')}</p>
                </div>
            )}
        </div>
    );
};

export default NewsListing;