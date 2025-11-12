import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { GoogleGenAI } from '@google/genai';
import { SOCIAL_PLATFORMS } from '../constants';
// FIX: Correct import path
import { SocialPlatform } from '../types';
import PostPreview from '../components/composer/PostPreview';
import TemplateSelector from '../components/composer/TemplateSelector';
import CharacterCount from '../components/composer/CharacterCount';

const SocialComposer: React.FC = () => {
    const { t } = useLocalization();
    const [postContent, setPostContent] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(() => new Set(['facebook']));
    const [isLoading, setIsLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    const handlePlatformToggle = (platformKey: string) => {
        setSelectedPlatforms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(platformKey)) {
                newSet.delete(platformKey);
            } else {
                newSet.add(platformKey);
            }
            return newSet;
        });
    };
    
    const handleGenerateWithAI = async () => {
        if (!aiPrompt || !process.env.API_KEY) return;
        setIsLoading(true);
        try {
            // FIX: Use new GoogleGenAI and ai.models.generateContent according to guidelines
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Generate a short social media post for an insurance agent about: "${aiPrompt}". Keep it under 280 characters. Include relevant hashtags.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            // FIX: Access the generated text directly from the .text property
            setPostContent(response.text);
        } catch (error) {
            console.error("Error generating content with AI", error);
            alert("Failed to generate content. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // This is a mock function
    const handleSchedulePost = () => {
        if (!postContent || selectedPlatforms.size === 0) {
            alert("Please write some content and select at least one platform.");
            return;
        }
        alert(`Scheduling post for: ${[...selectedPlatforms].join(', ')}`);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Composer */}
            <div className="lg:col-span-2 space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.socialPosts') as string}</h1>
                
                {/* AI Helper */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="font-semibold mb-2">{t('socialComposer.aiHelper.title') as string}</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder={t('socialComposer.aiHelper.placeholder') as string}
                            className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            disabled={isLoading}
                        />
                        <button onClick={handleGenerateWithAI} disabled={isLoading || !aiPrompt} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400">
                            {isLoading ? t('common.loading') : t('socialComposer.aiHelper.button')}
                        </button>
                    </div>
                </div>

                {/* Main Composer */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <div className="relative">
                        <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder={t('socialComposer.placeholder') as string}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:ring-blue-500 focus:border-blue-500 min-h-[200px] resize-none"
                        />
                        <CharacterCount current={postContent.length} max={280} />
                    </div>
                     <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <TemplateSelector onSelectTemplate={setPostContent} />
                        <div className="flex items-center gap-4">
                            {/* Mock image upload */}
                            <button className="text-gray-500 hover:text-blue-500">🖼️ Add Image</button>
                            <button onClick={handleSchedulePost} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                {t('socialComposer.schedule') as string}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Platforms & Preview */}
            <div className="space-y-6">
                 {/* Platform Selector */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="font-semibold mb-4">{t('socialComposer.platforms') as string}</h3>
                    <div className="space-y-3">
                        {SOCIAL_PLATFORMS.map((platform: SocialPlatform) => (
                            <div key={platform.key} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`platform-${platform.key}`}
                                    checked={selectedPlatforms.has(platform.key)}
                                    onChange={() => handlePlatformToggle(platform.key)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={`platform-${platform.key}`} className="ml-3 flex items-center gap-2 text-sm">
                                    {platform.icon}
                                    {platform.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div>
                    <h3 className="font-semibold mb-2">{t('socialComposer.preview') as string}</h3>
                    <PostPreview content={postContent} image={image} />
                </div>
            </div>
        </div>
    );
};

export default SocialComposer;