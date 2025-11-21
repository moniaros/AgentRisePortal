
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useLocalization } from '../../hooks/useLocalization';
import { Language } from '../../types';

interface HashtagManagerProps {
    content: string;
    onAddHashtag: (tag: string) => void;
}

const HashtagManager: React.FC<HashtagManagerProps> = ({ content, onAddHashtag }) => {
    const { language } = useLocalization();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const generateHashtags = async () => {
        if (!content || !process.env.API_KEY) return;
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const targetLang = language === Language.EL ? 'Greek' : 'English';
            
            const prompt = `
                Generate 8 high-traffic, relevant hashtags for the following social media post.
                IMPORTANT: The hashtags must be in ${targetLang} (or widely used English ones if appropriate for the context).
                Return ONLY the hashtags separated by spaces. No intro text.
            
                Post: "${content}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const text = response.text || '';
            // Split by space or newline, filter empty
            const tags = text.split(/[\s\n]+/).filter(t => t.startsWith('#'));
            setSuggestions(tags);

        } catch (error) {
            console.error("Hashtag error", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {language === Language.EL ? 'Έξυπνα Hashtags' : 'Smart Hashtags'}
                </h4>
                <button 
                    onClick={generateHashtags}
                    disabled={isLoading || !content}
                    className="text-xs text-purple-600 hover:underline disabled:opacity-50"
                >
                    {isLoading ? (language === Language.EL ? 'Σκέφτεται...' : 'Thinking...') : (language === Language.EL ? 'Ανανέωση' : 'Refresh Suggestions')}
                </button>
            </div>
            
            {suggestions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((tag, idx) => (
                        <button
                            key={idx}
                            onClick={() => onAddHashtag(tag)}
                            className="text-xs bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 px-2 py-1 rounded-md transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-purple-900/30"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-400 italic">
                    {language === Language.EL 
                        ? 'Κάντε κλικ στην ανανέωση για προτάσεις AI.' 
                        : 'Click refresh to get AI-powered tags based on your text.'}
                </p>
            )}
        </div>
    );
};

export default HashtagManager;
