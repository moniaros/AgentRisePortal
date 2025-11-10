import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchNewsArticles } from '../services/api';
import { NewsArticle } from '../types';
import { useAuth } from './useAuth';

export const useNewsData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const { data: allArticles, isLoading, error } = useOfflineSync<NewsArticle[]>('news_articles_data', fetchNewsArticles, []);
    
    // Show global articles and articles for the specific agency
    const articles = useMemo(() => allArticles.filter(a => a.agencyId === 'global' || a.agencyId === agencyId), [allArticles, agencyId]);
    
    return { articles, isLoading, error };
};
