import React from 'react';
import { MicrositeBlock, MicrositeConfig } from '../../types';
import HeroBlockPreview from './blocks/HeroBlockPreview';
import ProductsBlockPreview from './blocks/ProductsBlockPreview';
import TestimonialsBlockPreview from './blocks/TestimonialsBlockPreview';
import FaqBlockPreview from './blocks/FaqBlockPreview';
import ContactFormPreview from './blocks/ContactFormPreview';
import MicrositeHeader from './MicrositeHeader';
import MicrositeFooter from './MicrositeFooter';

interface SitePreviewProps {
    blocks: MicrositeBlock[];
    config: MicrositeConfig;
}

const SitePreview: React.FC<SitePreviewProps> = ({ blocks, config }) => {
    const renderBlock = (block: MicrositeBlock) => {
        switch (block.type) {
            case 'hero': return <HeroBlockPreview {...block} />;
            case 'products': return <ProductsBlockPreview {...block} />;
            case 'testimonials': return <TestimonialsBlockPreview {...block} />;
            case 'faq': return <FaqBlockPreview {...block} />;
            case 'contact': return <ContactFormPreview {...block} />;
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