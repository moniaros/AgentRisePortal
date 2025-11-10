import React from 'react';
import { BlockType } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface BuilderControlsProps {
    onAddBlock: (type: BlockType) => void;
    onOpenSettings: () => void;
}

const blockTypes: BlockType[] = ['hero', 'about', 'services', 'team', 'testimonials', 'faq', 'contact'];

const BuilderControls: React.FC<BuilderControlsProps> = ({ onAddBlock, onOpenSettings }) => {
    const { t } = useLocalization();
    return (
        <div className="space-y-4">
            <h2 className="font-semibold">{t('micrositeBuilder.controls')}</h2>
            <div className="grid grid-cols-2 gap-2">
                {blockTypes.map(type => (
                    <button key={type} onClick={() => onAddBlock(type)} className="p-2 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 capitalize">
                        + {type}
                    </button>
                ))}
            </div>
             <button onClick={onOpenSettings} className="w-full p-2 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900">
                {t('micrositeBuilder.siteSettings')}
            </button>
        </div>
    );
};

export default BuilderControls;
