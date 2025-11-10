import React from 'react';
import { MicrositeBlock, MicrositeConfig } from '../../types';
import MicrositeHeader from './MicrositeHeader';
import MicrositeFooter from './MicrositeFooter';
import HeroBlockPreview from './blocks/HeroBlockPreview';
import AboutBlockPreview from './blocks/AboutBlockPreview';
import ServicesBlockPreview from './blocks/ProductsBlockPreview';
import AwardsBlockPreview from './blocks/AwardsBlockPreview';
import TestimonialsBlockPreview from './blocks/TestimonialsBlockPreview';
import NewsBlockPreview from './blocks/NewsBlockPreview';
import ContactFormPreview from './blocks/ContactFormPreview';

interface SitePreviewProps {
    blocks: MicrositeBlock[];
    config: MicrositeConfig;
}

const SitePreview: React.FC<SitePreviewProps> = ({ blocks, config }) => {

    const renderBlock = (block: MicrositeBlock) => {
        if (block.isLoading) {
             return (
                <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg my-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }
        switch (block.type) {
            case 'hero': return <HeroBlockPreview {...block} />;
            case 'about': return <AboutBlockPreview {...block} />;
            case 'services': return <ServicesBlockPreview {...block} />;
            case 'awards': return <AwardsBlockPreview {...block} />;
            case 'testimonials': return <TestimonialsBlockPreview {...block} />;
            case 'news': return <NewsBlockPreview {...block} />;
            case 'contact': return <ContactFormPreview {...block} />;
            default: return null;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <MicrositeHeader config={config} blocks={blocks} />
            <main className="max-w-5xl mx-auto">
                {blocks.map(block => (
                    <div id={block.id} key={block.id}>
                        {renderBlock(block)}
                    </div>
                ))}
            </main>
            <MicrositeFooter config={config} />
        </div>
    );
};

export default SitePreview;
