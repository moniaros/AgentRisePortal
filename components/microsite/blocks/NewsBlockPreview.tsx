import React from 'react';
import { NewsBlock } from '../../../types';

const NewsBlockPreview: React.FC<NewsBlock> = ({ title, items }) => {
    return (
        <section className="py-8 my-2 px-4">
            <h2 className="text-3xl font-bold text-center mb-6">{title || 'Latest News'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{new Date(item.date || Date.now()).toLocaleDateString()}</p>
                        <h3 className="font-semibold text-lg mb-2">{item.title || 'News Headline'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.summary || 'Summary of the news or announcement.'}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default NewsBlockPreview;