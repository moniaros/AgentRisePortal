import React, { useState } from 'react';
import { useNewsData } from '../../../hooks/useNewsData';
import { useLocalization } from '../../../hooks/useLocalization';
import { NewsArticle } from '../../../types';
import NewsEditor from './NewsEditor';

const NewsManager: React.FC = () => {
    const { t } = useLocalization();
    const { articles, isLoading } = useNewsData();
    const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const handleAddNew = () => {
        setEditingArticle(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (article: NewsArticle) => {
        setEditingArticle(article);
        setIsEditorOpen(true);
    };

    const handleSave = (article: NewsArticle) => {
        // In a real app, this would call a function from the hook to save/update
        console.log('Saving article:', article);
        setIsEditorOpen(false);
    };

    return (
        <div>
            {isEditorOpen ? (
                <NewsEditor 
                    article={editingArticle}
                    onSave={handleSave}
                    onCancel={() => setIsEditorOpen(false)}
                />
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">{t('micrositeBuilder.content.newsList')}</h4>
                        <button onClick={handleAddNew} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                            {t('micrositeBuilder.content.addNews')}
                        </button>
                    </div>
                    {isLoading && <p>Loading...</p>}
                    <ul className="space-y-2">
                        {articles.map(article => (
                            <li key={article.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <span className="text-sm">{article.title}</span>
                                <button onClick={() => handleEdit(article)} className="text-xs text-blue-500">Edit</button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default NewsManager;
