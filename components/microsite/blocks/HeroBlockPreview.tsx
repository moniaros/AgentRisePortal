import React from 'react';
import { HeroBlock } from '../../../types';

const HeroBlockPreview: React.FC<HeroBlock> = ({ title, subtitle, ctaText }) => {
    return (
        <section className="text-center p-12 bg-gray-100 dark:bg-gray-700 rounded-lg my-2">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">{title || 'Hero Title'}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">{subtitle || 'Engaging subtitle goes here.'}</p>
            <button className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition">
                {ctaText || 'Call to Action'}
            </button>
        </section>
    );
};

export default HeroBlockPreview;
