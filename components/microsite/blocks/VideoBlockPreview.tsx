import React from 'react';
import { VideoBlock } from '../../../types';

const VideoBlockPreview: React.FC<VideoBlock> = ({ title, youtubeVideoId }) => {
    return (
        <section className="py-8 my-2 px-4">
            <h2 className="text-3xl font-bold text-center mb-6">{title || 'Watch Our Video'}</h2>
            <div className="aspect-w-16 aspect-h-9 max-w-3xl mx-auto">
                <iframe 
                    src={`https://www.youtube.com/embed/${youtubeVideoId || 'dQw4w9WgXcQ'}`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full rounded-lg shadow-md"
                ></iframe>
            </div>
        </section>
    );
};

export default VideoBlockPreview;
