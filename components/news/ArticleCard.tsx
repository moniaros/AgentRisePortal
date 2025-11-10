import React from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface ArticleCardProps {
    article: NewsArticle;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
    const { t, language } = useLocalization();

    return (
        <Link to={`/news/${article.id}`} className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />
            <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {t('news.publishedOn', { date: new Date(article.publishedDate).toLocaleDateString(language) })} {t('news.by')} {article.author.name}
                </p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{article.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{article.summary}</p>
                <div className="flex flex-wrap gap-2">
                    {article.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
        </Link>
    );
};

export default ArticleCard;
