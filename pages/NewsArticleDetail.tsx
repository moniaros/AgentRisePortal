import React, { useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useNewsData } from '../hooks/useNewsData';
import { useLocalization } from '../hooks/useLocalization';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import ShareButtons from '../components/news/ShareButtons';

const NewsArticleDetail: React.FC = () => {
    const { articleId } = useParams<{ articleId: string }>();
    const { t, language } = useLocalization();
    const { articles, isLoading, error } = useNewsData();

    const article = useMemo(() => {
        if (isLoading || !articles) return null;
        return articles.find(a => a.id === articleId);
    }, [articles, articleId, isLoading]);

    useEffect(() => {
        if (article) {
            document.title = article.seo.title;

            // Update meta description
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.setAttribute('name', 'description');
                document.head.appendChild(metaDescription);
            }
            metaDescription.setAttribute('content', article.seo.description);

            // Update canonical URL
            let canonicalLink = document.querySelector('link[rel="canonical"]');
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.setAttribute('rel', 'canonical');
                document.head.appendChild(canonicalLink);
            }
            canonicalLink.setAttribute('href', window.location.href);

            // Cleanup on unmount
            return () => {
                document.title = 'Aσφαλιστική Πύλη | Insurance Portal';
                if (metaDescription) {
                    metaDescription.setAttribute('content', 'A comprehensive lead generation and management platform for insurance professionals.');
                }
                if (canonicalLink) {
                    canonicalLink.remove();
                }
            };
        }
    }, [article]);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <SkeletonLoader className="h-10 w-3/4 mb-4" />
                <SkeletonLoader className="h-6 w-1/2 mb-8" />
                <SkeletonLoader className="h-80 w-full mb-8" />
                <SkeletonLoader className="h-6 w-full mb-4" />
                <SkeletonLoader className="h-6 w-full mb-4" />
                <SkeletonLoader className="h-6 w-5/6 mb-4" />
            </div>
        );
    }
    
    if (error) return <ErrorMessage message={error.message} />;
    
    if (!article) {
        // After loading, if article is not found, redirect.
        return <Navigate to="/news" replace />;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Link to="/news" className="text-blue-500 hover:underline text-sm mb-6 inline-block">
                &larr; {t('news.backToList')}
            </Link>

            <article>
                <header>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{article.title}</h1>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                        {article.author.avatarUrl && <img src={article.author.avatarUrl} alt={article.author.name} className="w-8 h-8 rounded-full mr-3" />}
                        <span>{t('news.by')} <strong>{article.author.name}</strong> &bull; {t('news.publishedOn', { date: new Date(article.publishedDate).toLocaleDateString(language) })}</span>
                    </div>
                </header>
                
                <img src={article.imageUrl} alt={article.title} className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg mb-8" />

                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: article.content }}></div>

                <footer className="mt-12 pt-8 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start gap-6">
                    <div>
                        <h4 className="font-semibold text-sm mb-2">{t('news.tags')}</h4>
                         <div className="flex flex-wrap gap-2">
                            {article.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 text-xs bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                    <ShareButtons title={article.title} url={window.location.href} />
                </footer>
            </article>
        </div>
    );
};

export default NewsArticleDetail;