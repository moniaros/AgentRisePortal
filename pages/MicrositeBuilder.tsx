import React, { useState, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import BuilderControls from '../components/microsite/BuilderControls';
import SitePreview from '../components/microsite/SitePreview';
import { MicrositeBlock, MicrositeConfig } from '../types';

const initialBlocks: MicrositeBlock[] = [
    { id: 'hero_1', type: 'hero', title: 'Your Trusted Insurance Partner', subtitle: 'Protecting what matters most to you.', ctaText: 'Get a Free Quote' },
    { id: 'about_1', type: 'about', title: 'About Our Agency', content: 'We are a dedicated team of professionals with years of experience, committed to providing personalized insurance solutions. Our mission is to help you navigate the complexities of insurance with ease and confidence.', imageUrl: 'https://via.placeholder.com/500x300?text=Our+Agency' },
    { id: 'services_1', type: 'services', title: 'Our Services', services: [
        { id: 'serv_1', name: 'Auto Insurance', description: 'Comprehensive coverage for your vehicle, ensuring you are protected on the road.'},
        { id: 'serv_2', name: 'Home Insurance', description: 'Protect your home and belongings from unforeseen events with our flexible policies.'},
        { id: 'serv_3', name: 'Life Insurance', description: 'Secure your family\'s future with a life insurance plan that fits your needs.'},
    ]},
];

const initialConfig: MicrositeConfig = {
    siteTitle: 'My Insurance Agency',
    themeColor: '#3b82f6',
    contactEmail: 'contact@myagency.com',
    contactPhone: '555-123-4567',
    address: '123 Main St, Anytown, USA',
    social: { facebook: '#', linkedin: '#', x: '#' }
};

const MicrositeBuilder: React.FC = () => {
    const { t } = useLocalization();
    const [blocks, setBlocks] = useState<MicrositeBlock[]>(initialBlocks);
    const [config, setConfig] = useState<MicrositeConfig>(initialConfig);

    const handleUpdateBlock = useCallback((updatedBlock: MicrositeBlock) => {
        setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    }, []);

    return (
        <div className="flex h-[calc(100vh-120px)]">
            <div className="w-full md:w-1/3 p-4 bg-white dark:bg-gray-800 border-r dark:border-gray-700 overflow-y-auto">
                 <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('nav.micrositeBuilder')}</h1>
                <BuilderControls 
                    blocks={blocks} 
                    setBlocks={setBlocks}
                    config={config}
                    setConfig={setConfig}
                    onUpdateBlock={handleUpdateBlock}
                />
            </div>
            <div className="hidden md:block md:w-2/3 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                <SitePreview blocks={blocks} config={config} />
            </div>
        </div>
    );
};

export default MicrositeBuilder;
