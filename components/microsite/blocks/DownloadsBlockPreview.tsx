import React from 'react';
import { DownloadsBlock } from '../../../types';

const DownloadsBlockPreview: React.FC<DownloadsBlock> = ({ title, files }) => {
    return (
        <section className="py-8 my-2 px-4">
            <h2 className="text-3xl font-bold text-center mb-6">{title || 'Downloads'}</h2>
            <ul className="max-w-2xl mx-auto space-y-3">
                {files.map(file => (
                    <li key={file.id}>
                        <a 
                            href={file.fileUrl || '#'} 
                            download 
                            className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                        >
                            <span>{file.title || 'Downloadable File'}</span>
                            <span>&#x2193;</span>
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default DownloadsBlockPreview;
