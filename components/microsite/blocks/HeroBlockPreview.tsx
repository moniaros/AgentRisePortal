import React from 'react';
import { HeroBlock } from '../../../types';

const HeroBlockPreview: React.FC<HeroBlock> = ({ title, subtitle, ctaText }) => {
    return (
        <section className="text-center py-20 bg-gray-100 dark:bg-gray-700 rounded-lg my-2">
            <h1 className="text-4xl font-bold mb-4">{title || 'Your Catchy Headline'}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{subtitle || 'A compelling subtitle goes here.'}</p>
            {ctaText && (
                <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
                    {ctaText}
                </button>
            )}
        </section>
    );
};

export default HeroBlockPreview;
