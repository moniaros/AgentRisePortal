
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface AIContentRefinerProps {
    initialValue: string;
    fieldName: string;
    context: string; // e.g., the block type or page context
    onAccept: (newValue: string) => void;
}

const AIContentRefiner: React.FC<AIContentRefinerProps> = ({ initialValue, fieldName, context, onAccept }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleRefine = async () => {
        if (!process.env.API_KEY) return;
        setIsGenerating(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Rewrite the following text for an insurance agency website.
                Context: This is the '${fieldName}' for a '${context}' section.
                Goal: Make it professional, persuasive, and trustworthy.
                Current Text: "${initialValue || 'Draft text'}"
                
                Return ONLY the rewritten text.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            if (response.text) {
                onAccept(response.text.trim());
            }
        } catch (err) {
            console.error("Refinement failed", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button 
            type="button"
            onClick={handleRefine}
            disabled={isGenerating}
            className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
            title="Rewrite with AI"
        >
            {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436h.673a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-.673a22.601 22.601 0 01-12.436-6.084a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v.673c3.703 2.881 8.202 5.264 13.257 5.264.75 0 .75-.75 0-.75-5.055 0-9.555-2.383-12.436-6.084a.75.75 0 01-.75-.75V2.25a.75.75 0 01.75-.75h.673zM5.25 4.5a.75.75 0 01.75-.75h.672c.675 1.374 1.565 2.622 2.621 3.706l-3.293 3.293V4.5zM2.25 2.25a.75.75 0 01.75.75v1.5c0 1.79.445 3.47 1.228 4.965L2.06 11.682A.75.75 0 011.5 11.25v-9a.75.75 0 01.75-.75h9a.75.75 0 01.432 1.31l-2.217 2.217c-1.496-.783-3.175-1.228-4.965-1.228H2.25z" clipRule="evenodd" />
                </svg>
            )}
        </button>
    );
};

export default AIContentRefiner;
