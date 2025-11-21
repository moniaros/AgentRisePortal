import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface ImageGeneratorProps {
    topic: string;
    currentContent: string;
    onImageGenerated: (base64Image: string) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ topic, currentContent, onImageGenerated }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Auto-suggest a prompt based on the content
    const suggestPrompt = async () => {
        if (!process.env.API_KEY) return;
        
        // Use simple logic or AI to create a prompt if needed, for now we construct it
        const baseText = currentContent || topic;
        if (!baseText) return;

        // Simplified prompt construction to avoid another API call for latency
        setPrompt(`A professional, high-quality photo for an insurance advertisement about: ${topic}. Bright, trustworthy, warm lighting, 4k resolution.`);
    };

    const handleGenerate = async () => {
        if (!prompt || !process.env.API_KEY) return;
        setIsGenerating(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Use Gemini 2.5 Flash Image for generation (as per guidelines for general image tasks)
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { text: prompt }
                    ]
                },
                config: {
                    imageConfig: {
                        aspectRatio: '1:1', 
                        // numberOfImages: 1 // Default
                    }
                }
            });

            // Handle response parsing for image
            // The guidelines say we must iterate to find the image part
            let imageFound = false;
            if (response.candidates && response.candidates[0].content.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64String = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || 'image/png';
                        onImageGenerated(`data:${mimeType};base64,${base64String}`);
                        imageFound = true;
                        break;
                    }
                }
            }

            if (!imageFound) {
                throw new Error("No image data received.");
            }

        } catch (err) {
            console.error("Image generation error:", err);
            setError("Failed to generate image. Quota may be exceeded or model unavailable.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                🖼️ AI Image Studio
            </h3>
            
            <div className="space-y-3">
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
        </div>
    );
};

export default ImageGenerator;
