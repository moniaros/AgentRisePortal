import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchNewsArticles } from '../services/api';
import { NewsArticle } from '../types';
import { useAuth } from './useAuth';

export const useNewsData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allArticles,
        isLoading,
        error,
    } = useOfflineSync<NewsArticle[]>('news_articles_data', fetchNewsArticles, []);

    const articles = useMemo(() => {
        // 'global' articles are for everyone, agency-specific ones are for that agency
        return allArticles.filter(article => article.agencyId === 'global' || article.agencyId === agencyId);
    }, [allArticles, agencyId]);

    return { articles, isLoading, error };
};
