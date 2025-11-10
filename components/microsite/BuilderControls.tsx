import React from 'react';
import { MicrositeBlock } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface BuilderControlsProps {
    blocks: MicrositeBlock[];
    setBlocks: (blocks: MicrositeBlock[]) => void;
    selectedBlockId: string | null;
    setSelectedBlockId: (id: string | null) => void;
    onOpenSettings: () => void;
}

const BuilderControls: React.FC<BuilderControlsProps> = ({ blocks, setBlocks, selectedBlockId, setSelectedBlockId, onOpenSettings }) => {
    const { t } = useLocalization();

    // In a real app, this would have drag-and-drop functionality
    return (
        <div>
            <h3 className="font-semibold mb-2">{t('micrositeBuilder.structure')}</h3>
            <button onClick={onOpenSettings} className="w-full text-left p-2 rounded-md bg-gray-200 dark:bg-gray-700 mb-2">
                {t('micrositeBuilder.siteSettings')}
            </button>
            <ul className="space-y-2">
                {blocks.map(block => (
                    <li key={block.id}>
                        <button
                            onClick={() => setSelectedBlockId(block.id)}
                            className={`w-full text-left p-2 rounded-md capitalize ${selectedBlockId === block.id ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-600'}`}
                        >
                            {block.type}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BuilderControls;
