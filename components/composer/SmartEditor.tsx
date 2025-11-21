
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import HashtagManager from './HashtagManager';
import { useLocalization } from '../../hooks/useLocalization';
import { Language } from '../../types';

interface SmartEditorProps {
    value: string;
    onChange: (value: string) => void;
    platform: string;
}

const SmartEditor: React.FC<SmartEditorProps> = ({ value, onChange, platform }) => {
    const { language } = useLocalization();
    const [isThinking, setIsThinking] = useState(false);

    const handleAiAction = async (action: 'shorten' | 'expand' | 'emojify' | 'fix') => {
        if (!value || !process.env.API_KEY) return;
        setIsThinking(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const targetLang = language === Language.EL ? 'Greek' : 'English';
            const langInstruction = `IMPORTANT: The output MUST be in ${targetLang}. Do not switch languages.`;

            let prompt = "";

            switch (action) {
                case 'shorten':
                    prompt = `Rewrite the following social media post to be more concise and punchy. Keep the core message. ${langInstruction} \n\nOriginal Text: "${value}"`;
                    break;
                case 'expand':
                    prompt = `Expand the following social media post with more persuasive details and benefits regarding insurance. ${langInstruction} \n\nOriginal Text: "${value}"`;
                    break;
                case 'emojify':
                    prompt = `Add relevant, engaging emojis to the following text. Do not remove the original text, just enhance it. ${langInstruction} \n\nOriginal Text: "${value}"`;
                    break;
                case 'fix':
                    prompt = `Fix grammar, spelling, and improve the professional flow of this text to make it sound like an expert insurance agent. ${langInstruction} \n\nOriginal Text: "${value}"`;
                    break;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            if (response.text) {
                onChange(response.text.trim());
            }
        } catch (err) {
            console.error("AI Action failed", err);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-gray-400 uppercase mr-2">AI Tools:</span>
                <button 
                    onClick={() => handleAiAction('shorten')} 
                    disabled={isThinking || !value}
                    className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full hover:bg-indigo-100 transition flex items-center gap-1"
                >
                    <span>✂️</span> {language === Language.EL ? 'Σύντμηση' : 'Shorten'}
                </button>
                <button 
                    onClick={() => handleAiAction('expand')} 
                    disabled={isThinking || !value}
                    className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full hover:bg-indigo-100 transition flex items-center gap-1"
                >
                    <span>➕</span> {language === Language.EL ? 'Επέκταση' : 'Expand'}
                </button>
                <button 
                    onClick={() => handleAiAction('emojify')} 
                    disabled={isThinking || !value}
                    className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full hover:bg-indigo-100 transition flex items-center gap-1"
                >
                    <span>😀</span> Emojis
                </button>
                <button 
                    onClick={() => handleAiAction('fix')} 
                    disabled={isThinking || !value}
                    className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full hover:bg-indigo-100 transition flex items-center gap-1"
                >
                    <span>🪄</span> {language === Language.EL ? 'Βελτίωση' : 'Polish'}
                </button>
            </div>

            {/* Editor Area */}
            <div className="relative flex-grow group">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={language === Language.EL ? `Γράψτε την ανάρτησή σας για ${platform}...` : `Write your ${platform} post here...`}
                    className="w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-sans text-base leading-relaxed transition-shadow"
                    disabled={isThinking}
                />
                {isThinking && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-md">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="flex justify-between items-center mt-2">
                <span className={`text-xs font-mono ${value.length > (platform === 'x' ? 280 : 2200) ? 'text-red-500' : 'text-gray-400'}`}>
                    {value.length} chars
                </span>
                <HashtagManager content={value} onAddHashtag={(tag) => onChange(`${value} ${tag}`)} />
            </div>
        </div>
    );
};

export default SmartEditor;
