

import React from 'react';
import { Campaign } from '../../../types';
import AdPreview from '../AdPreview';

interface StepProps {
    // FIX: Aligned the data type with the parent wizard's state to resolve type mismatch.
    data: Omit<Campaign, 'id' | 'agencyId'>;
    setData: React.Dispatch<React.SetStateAction<Omit<Campaign, 'id' | 'agencyId'>>>;
}

const Step4Creative: React.FC<StepProps> = ({ data, setData }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Headline</label>
                    <input
                        type="text"
                        value={data.creative.headline}
                        onChange={e => setData(prev => ({ ...prev, creative: { ...prev.creative, headline: e.target.value } }))}
                        className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Body Text</label>
                    <textarea
                        value={data.creative.body}
                        onChange={e => setData(prev => ({ ...prev, creative: { ...prev.creative, body: e.target.value } }))}
                        className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        rows={4}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                    <input
                        type="text"
                        value={data.creative.image}
                        onChange={e => setData(prev => ({ ...prev, creative: { ...prev.creative, image: e.target.value } }))}
                        className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        placeholder="https://example.com/image.png"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</label>
                <AdPreview creative={data.creative} />
            </div>
        </div>
    );
};
export default Step4Creative;