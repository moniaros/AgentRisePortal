import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { NewsArticle } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface NewsEditorProps {
    article: NewsArticle | null;
    onSave: (article: NewsArticle) => void;
    onCancel: () => void;
}

const NewsEditor: React.FC<NewsEditorProps> = ({ article, onSave, onCancel }) => {
    const { t } = useLocalization();
    const { register, handleSubmit, reset } = useForm<NewsArticle>({
        defaultValues: article || {}
    });

    useEffect(() => {
        reset(article || {});
    }, [article, reset]);

    const onSubmit = (data: NewsArticle) => {
        onSave({ ...data, id: article?.id || `news_${Date.now()}` });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h4 className="font-semibold">{article ? t('micrositeBuilder.content.editNews') : t('micrositeBuilder.content.addNews')}</h4>
            <input {...register('title', { required: true })} placeholder="Title" className="w-full p-2 border rounded dark:bg-gray-700" />
            <textarea {...register('summary')} placeholder="Summary" className="w-full p-2 border rounded dark:bg-gray-700" />
            <textarea {...register('content')} placeholder="Full Content (HTML allowed)" rows={6} className="w-full p-2 border rounded dark:bg-gray-700" />
            <input {...register('imageUrl')} placeholder="Image URL" className="w-full p-2 border rounded dark:bg-gray-700" />
            
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
        </form>
    );
};

export default NewsEditor;
