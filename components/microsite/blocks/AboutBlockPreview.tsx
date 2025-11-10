import React from 'react';
import { AboutBlock } from '../../../types';

const AboutBlockPreview: React.FC<AboutBlock> = ({ title, content, imageUrl }) => {
    return (
        <section className="py-8 my-2 px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <img src={imageUrl || 'https://via.placeholder.com/500x300.png?text=Our+Agency'} alt={title} className="rounded-lg shadow-md w-full" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold mb-4">{title || 'About Us'}</h2>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{content || 'Information about the agency.'}</p>
                </div>
            </div>
        </section>
    );
};

export default AboutBlockPreview;