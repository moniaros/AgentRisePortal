import React from 'react';
import { AwardsBlock } from '../../../types';

const AwardsBlockPreview: React.FC<AwardsBlock> = ({ title, awards }) => {
    return (
        <section className="py-8 bg-gray-50 dark:bg-gray-700/50 my-2 rounded-lg px-4">
            <h2 className="text-3xl font-bold text-center mb-6">{title || 'Awards & Recognition'}</h2>
            <div className="max-w-3xl mx-auto">
                <ul className="space-y-4">
                    {awards.map(award => (
                        <li key={award.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 border-yellow-400">
                            <p className="font-semibold text-lg">{award.title || 'Prestigious Award'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{award.issuer || 'Awarding Body'}, {award.year || '2023'}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default AwardsBlockPreview;