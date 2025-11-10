import React, { useState, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { MicrositeBlock, MicrositeConfig } from '../types';
import BuilderControls from '../components/microsite/BuilderControls';
import SitePreview from '../components/microsite/SitePreview';

const initialBlocks: MicrositeBlock[] = [
    { id: 'hero_1', type: 'hero', title: 'Your Trusted Insurance Partner', subtitle: 'Providing peace of mind for you and your family.', ctaText: 'Get a Free Quote' },
    { id: 'about_1', type: 'about', title: 'About Our Agency', content: 'We are a dedicated team of professionals committed to providing personalized insurance solutions.', imageUrl: 'https://via.placeholder.com/500x300.png?text=Our+Team' },
    { id: 'services_1', type: 'services', title: 'Our Insurance Services', services: [{id: 's1', name: 'Auto Insurance', description: 'Comprehensive coverage for your vehicle.'}, {id: 's2', name: 'Home Insurance', description: 'Protect your home and belongings.'}] },
    { id: 'contact_1', type: 'contact', title: 'Contact Us', subtitle: 'Reach out for a personalized consultation.' },
];

const initialConfig: MicrositeConfig = {
    siteTitle: 'My Insurance Agency',
    themeColor: '#3b82f6',
    contactEmail: 'agent@example.com',
    contactPhone: '555-123-4567',
    address: '123 Main St, Anytown, USA',
    social: {
        facebook: '#',
        linkedin: '#',
        x: '#'
    }
};

const MicrositeBuilder: React.FC = () => {
    const { t } = useLocalization();
    const [blocks, setBlocks] = useState<MicrositeBlock[]>(initialBlocks);
    const [config, setConfig] = useState<MicrositeConfig>(initialConfig);

    const handleUpdateBlock = useCallback((updatedBlock: MicrositeBlock) => {
        setBlocks(prevBlocks => prevBlocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    }, []);
    
    // In a real app, this would be a save to backend function
    const handleSave = () => {
        console.log("Saving microsite:", { config, blocks });
        alert('Microsite saved! (Check console for data)');
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.micrositeBuilder') as string}</h1>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {t('micrositeBuilder.save')}
                </button>
            </div>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md overflow-y-auto">
                    <BuilderControls
                        blocks={blocks}
                        setBlocks={setBlocks}
                        config={config}
                        setConfig={setConfig}
                        onUpdateBlock={handleUpdateBlock}
                    />
                </div>
                <div className="lg:col-span-2 overflow-y-auto">
                    <SitePreview blocks={blocks} config={config} />
                </div>
            </div>
        </div>
    );
};

export default MicrositeBuilder;