import React from 'react';
import { MicrositeBlock, MicrositeConfig } from '../../types';
import HeroBlockPreview from './blocks/HeroBlockPreview';
import ServicesBlockPreview from './blocks/ProductsBlockPreview';
import TestimonialsBlockPreview from './blocks/TestimonialsBlockPreview';
import AboutBlockPreview from './blocks/AboutBlockPreview';
import AwardsBlockPreview from './blocks/AwardsBlockPreview';
import NewsBlockPreview from './blocks/NewsBlockPreview';
import ContactFormPreview from './blocks/ContactFormPreview';
import MicrositeHeader from './MicrositeHeader';
import MicrositeFooter from './MicrositeFooter';
import SkeletonLoader from '../ui/SkeletonLoader';
import FaqBlockPreview from './blocks/FaqBlockPreview';

interface SitePreviewProps {
    blocks: MicrositeBlock[];
    config: MicrositeConfig;
}

const SitePreview: React.FC<SitePreviewProps> = ({ blocks, config }) => {
    const renderBlock = (block: MicrositeBlock) => {
        if (block.isLoading) {
            return <SkeletonLoader className="h-48 w-full my-2" />;
        }
        switch (block.type) {
            case 'hero': return <HeroBlockPreview {...block} />;
            case 'about': return <AboutBlockPreview {...block} />;
            case 'services': return <ServicesBlockPreview {...block} />;
            case 'awards': return <AwardsBlockPreview {...block} />;
            case 'testimonials': return <TestimonialsBlockPreview {...block} />;
            case 'news': return <NewsBlockPreview {...block} />;
            case 'contact': return <ContactFormPreview {...block} />;
            case 'faq': return <FaqBlockPreview {...block} />;
            default: return null;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full">
           <MicrositeHeader config={config} blocks={blocks} />
            <main>
                {blocks.map(block => (
                    <section key={block.id} id={block.id}>
                        {renderBlock(block)}
                    </section>
                ))}
            </main>
            <MicrositeFooter config={config} />
        </div>
    );
};

export default SitePreview;
