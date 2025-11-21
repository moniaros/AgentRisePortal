import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

interface MediaManagerProps {
    topic: string;
    currentContent: string;
    onMediaSelected: (base64Image: string) => void;
}

const MediaManager: React.FC<MediaManagerProps> = ({ topic, currentContent, onMediaSelected }) => {
    const [activeTab, setActiveTab] = useState<'ai' | 'upload'>('ai');
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-suggest a prompt based on the content
    const suggestPrompt = async () => {
        if (!process.env.API_KEY) return;
        const baseText = currentContent || topic;
        if (!baseText) return;
        setPrompt(`A professional, high-quality photo for an insurance advertisement about: ${topic}. Bright, trustworthy, warm lighting, 4k resolution.`);
    };

    const handleGenerate = async () => {
        if (!prompt || !process.env.API_KEY) return;
        setIsGenerating(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: { imageConfig: { aspectRatio: '1:1' } }
            });

            let imageFound = false;
            if (response.candidates && response.candidates[0].content.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64String = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || 'image/png';
                        onMediaSelected(`data:${mimeType};base64,${base64String}`);
                        imageFound = true;
                        break;
                    }
                }
            }
            if (!imageFound) throw new Error("No image data received.");

        } catch (err) {
            console.error("Image generation error:", err);
            setError("Failed to generate image. Quota may be exceeded.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onMediaSelected(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    🖼️ Media Studio
                </h3>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button 
                        onClick={() => setActiveTab('ai')}
                        className={`px-3 py-1 text-xs rounded-md transition ${activeTab === 'ai' ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-500'}`}
                    >
                        AI Gen
                    </button>
                    <button 
                        onClick={() => setActiveTab('upload')}
                        className={`px-3 py-1 text-xs rounded-md transition ${activeTab === 'upload' ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-500'}`}
                    >
                        Upload
                    </button>
                </div>
            </div>
            
            {activeTab === 'ai' && (
                <div className="space-y-3 animate-fade-in">
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Image Prompt</label>
                        <div className="flex gap-2 mt-1">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the image you want..."
                                rows={2}
                                className="flex-grow p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                            <button 
                                onClick={suggestPrompt}
                                className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 p-2 rounded border dark:border-gray-600"
                                title="Auto-suggest prompt"
                            >
                                🪄
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt}
                        className="w-full py-2 bg-purple-600 text-white text-sm font-semibold rounded hover:bg-purple-700 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Creating Visuals...
                            </>
                        ) : (
                            "Generate Image"
                        )}
                    </button>
                </div>
            )}

            {activeTab === 'upload' && (
                <div className="space-y-3 animate-fade-in">
                    <div 
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Click to upload image</p>
                        <p className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaManager;