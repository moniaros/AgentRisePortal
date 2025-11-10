import React from 'react';
import { PolicyHighlightsBlock } from '../../../types';

const PolicyHighlightsBlockPreview: React.FC<PolicyHighlightsBlock> = ({ title, highlights }) => {
    return (
        <section className="py-8 my-2 px-4">
            <h2 className="text-3xl font-bold text-center mb-6">{title || 'Policy Highlights'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {highlights.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                        <h3 className="font-semibold text-lg mb-2">{item.title || 'Highlight Title'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.description || 'Description of the policy highlight.'}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PolicyHighlightsBlockPreview;
