
import React from 'react';
import { Campaign } from '../../types';

interface AdPreviewProps {
    creative: Campaign['creative'];
}

const AdPreview: React.FC<AdPreviewProps> = ({ creative }) => {
    return (
        <div className="border dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                    <div className="font-bold">Your Brand</div>
                    <div className="text-xs text-gray-500">Sponsored</div>
                </div>
            </div>
            <p className="text-sm mb-2">{creative.body || "Your ad copy will appear here."}</p>
            {creative.image ? (
                <img src={creative.image} alt="Ad preview" className="w-full rounded-md" />
            ) : (
                <div className="w-full h-40 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 rounded-md">
                    Image Preview
                </div>
            )}
            <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-b-lg">
                <div className="text-xs uppercase text-gray-500">yoursite.com</div>
                <div className="font-semibold">{creative.headline || "Your Headline"}</div>
            </div>
        </div>
    );
};

export default AdPreview;
