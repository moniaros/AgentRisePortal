import React from 'react';
import { FaqBlock } from '../../../types';

const FaqBlockPreview: React.FC<FaqBlock> = ({ title, items }) => {
    return (
        <section className="py-8 my-2">
            <h2 className="text-3xl font-bold text-center mb-6">{title || 'Frequently Asked Questions'}</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
                {items.map(item => (
                    <details key={item.id} className="p-4 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/50">
                        <summary className="font-semibold cursor-pointer">{item.question || 'Example Question?'}</summary>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.answer || 'Detailed answer to the frequently asked question.'}</p>
                    </details>
                ))}
            </div>
        </section>
    );
};

export default FaqBlockPreview;
