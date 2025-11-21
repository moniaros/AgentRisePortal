import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { GoogleGenAI } from '@google/genai';
import { SOCIAL_PLATFORMS } from '../constants';
import { SocialPlatform } from '../types';
import PostPreview from '../components/composer/PostPreview';
import ComplianceCheck from '../components/composer/ComplianceCheck';
import MediaManager from '../components/composer/MediaManager';
import VoiceSelector, { BrandVoice } from '../components/composer/VoiceSelector';
import CampaignBrief, { CampaignStrategy } from '../components/composer/CampaignBrief';
import SmartEditor from '../components/composer/SmartEditor';
import TopicInspiration from '../components/composer/TopicInspiration';
import EngagementScore from '../components/composer/EngagementScore';

type PlatformContent = Record<string, string>;

interface SavedDraft {
    id: string;
    timestamp: number;
    strategy: CampaignStrategy;
    content: PlatformContent;
}

const SocialComposer: React.FC = () => {
    const { t, language } = useLocalization();
    const [activeTab, setActiveTab] = useState<string>('facebook');
    const [selectedVoice, setSelectedVoice] = useState<BrandVoice>('professional');
    const [scheduleDate, setScheduleDate] = useState('');
    
    // Strategy State
    const [strategy, setStrategy] = useState<CampaignStrategy>({
        objective: 'awareness',
        audience: '',
        keyMessage: ''
    });

    // Content State
    const [platformContent, setPlatformContent] = useState<PlatformContent>({
        facebook: '',
        instagram: '',
        linkedin: '',
        x: ''
    });
    const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Drafts State
    const [drafts, setDrafts] = useState<SavedDraft[]>([]);

    // Load drafts on mount
    useEffect(() => {
        const storedDrafts = localStorage.getItem('social_drafts');
        if (storedDrafts) {
            setDrafts(JSON.parse(storedDrafts));
        }
    }, []);

    // Auto-save current work as a "Current Session" draft
    const saveDraft = () => {
        if (!strategy.keyMessage) return;
        const newDraft: SavedDraft = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            strategy,
            content: platformContent
        };
        const updatedDrafts = [newDraft, ...drafts].slice(0, 10); // Keep last 10
        setDrafts(updatedDrafts);
        localStorage.setItem('social_drafts', JSON.stringify(updatedDrafts));
    };

    const loadDraft = (draft: SavedDraft) => {
        setStrategy(draft.strategy);
        setPlatformContent(draft.content);
    };

    const handleContentChange = (value: string) => {
        setPlatformContent(prev => ({ ...prev, [activeTab]: value }));
    };

    const handleTopicSelect = (topic: string) => {
        setStrategy(prev => ({ ...prev, keyMessage: topic }));
    };

    const handleGenerateCampaign = async () => {
        if (!strategy.keyMessage || !process.env.API_KEY) return;
        setIsGenerating(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const platforms = ['facebook', 'instagram', 'linkedin', 'x'];
            
            // Localization Context
            const targetLanguage = language === 'el' ? 'Greek' : 'English';
            const langInstruction = `You are an expert social media copywriter. Write ALL output in ${targetLanguage}.`;

            const promises = platforms.map(async (platform) => {
                let systemInstruction = '';
                
                const voiceInstructions = {
                    professional: "Use a formal, authoritative, and trustworthy tone.",
                    empathetic: "Use a warm, caring, and understanding tone. Focus on peace of mind.",
                    witty: "Use a clever, slightly humorous, and engaging tone.",
                    urgent: "Use action-oriented language. Create a sense of FOMO.",
                    educational: "Focus on facts, tips, and explaining complex concepts simply."
                };

                const baseContext = `
                    ${langInstruction}
                    Objective: ${strategy.objective.toUpperCase()}.
                    Target Audience: ${strategy.audience || 'General Public'}.
                    Tone: ${voiceInstructions[selectedVoice]}
                `;

                switch (platform) {
                    case 'linkedin':
                        systemInstruction = `${baseContext} Write a LinkedIn post. Structure: Hook, Value Proposition, Bullet points, Call to Action.`;
                        break;
                    case 'instagram':
                        systemInstruction = `${baseContext} Write an Instagram caption. Focus on the visual aspect. Include 'Link in Bio' and 3-5 relevant hashtags.`;
                        break;
                    case 'x':
                        systemInstruction = `${baseContext} Write a post for X (Twitter). Limit strictly to 280 characters. Concise and punchy.`;
                        break;
                    case 'facebook':
                    default:
                        systemInstruction = `${baseContext} Write a Facebook post. Encourage comments and community interaction.`;
                        break;
                }

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Write a social media post about: "${strategy.keyMessage}"`,
                    config: { systemInstruction }
                });
                
                return { platform, text: response.text || '' };
            });

            const results = await Promise.all(promises);
            
            const newContent: PlatformContent = {};
            results.forEach(res => {
                newContent[res.platform] = res.text;
            });

            setPlatformContent(newContent);
            // Auto save after generation
            saveDraft();

        } catch (error) {
            console.error("Error generating campaign", error);
            alert("Failed to generate campaign. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6 overflow-hidden p-2">
            
            {/* Column 1: Strategy & History (Left Panel) - Sticky */}
            <div className="lg:w-1/4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{t('nav.socialPosts')}</h1>
                    <p className="text-xs text-gray-500">Content Command Center</p>
                </div>

                <TopicInspiration onSelectTopic={handleTopicSelect} />

                <CampaignBrief 
                    strategy={strategy} 
                    onChange={setStrategy} 
                    isGenerating={isGenerating} 
                />

                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">2. Brand Voice</h3>
                    <VoiceSelector selectedVoice={selectedVoice} onChange={setSelectedVoice} />
                </div>

                <button 
                    onClick={handleGenerateCampaign} 
                    disabled={isGenerating || !strategy.keyMessage} 
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-md hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg"
                >
                    {isGenerating ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            Creating...
                        </>
                    ) : (
                        <><span>✨</span> Generate Campaign</>
                    )}
                </button>

                {/* Drafts List */}
                <div className="mt-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Recent Drafts</h4>
                    <ul className="space-y-2">
                        {drafts.map(draft => (
                            <li 
                                key={draft.id} 
                                onClick={() => loadDraft(draft)}
                                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border border-transparent hover:border-blue-200 transition-all"
                            >
                                <p className="text-xs font-medium truncate text-gray-700 dark:text-gray-200">{draft.strategy.keyMessage}</p>
                                <p className="text-[10px] text-gray-400">{new Date(draft.timestamp).toLocaleDateString()} • {draft.strategy.objective}</p>
                            </li>
                        ))}
                        {drafts.length === 0 && <p className="text-xs text-gray-400 italic">No drafts saved yet.</p>}
                    </ul>
                </div>
            </div>

            {/* Column 2: Smart Editor (Center Panel) */}
            <div className="lg:w-2/5 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700 overflow-hidden">
                <div className="flex border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    {SOCIAL_PLATFORMS.map((platform: SocialPlatform) => (
                        <button
                            key={platform.key}
                            onClick={() => setActiveTab(platform.key)}
                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${
                                activeTab === platform.key
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span className="scale-75">{platform.icon}</span>
                            <span className="hidden sm:inline">{platform.name}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-grow p-4">
                    <SmartEditor 
                        value={platformContent[activeTab]} 
                        onChange={handleContentChange} 
                        platform={activeTab}
                    />
                </div>
                
                {/* Scheduling Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Schedule:</span>
                        <input 
                            type="datetime-local" 
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="p-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-bold shadow-sm transition-transform active:scale-95">
                        {scheduleDate ? 'Schedule Post' : 'Post Now'}
                    </button>
                </div>
            </div>

            {/* Column 3: Preview & Tools (Right Panel) - Sticky */}
            <div className="lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
                
                <EngagementScore 
                    content={platformContent[activeTab]} 
                    platform={activeTab}
                    hasImage={!!selectedMedia}
                />

                {/* Live Preview */}
                <div className="bg-gray-100 dark:bg-black/20 p-4 rounded-xl border dark:border-gray-700 flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-xs font-bold text-gray-500 uppercase">Live Preview</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">{activeTab}</span>
                    </div>
                    <PostPreview 
                        content={platformContent[activeTab]} 
                        image={selectedMedia} 
                        platform={activeTab}
                    />
                </div>

                {/* Tools Accordion */}
                <div className="space-y-4">
                    <MediaManager 
                        topic={strategy.keyMessage} 
                        currentContent={platformContent[activeTab]} 
                        onMediaSelected={setSelectedMedia} 
                    />
                    <ComplianceCheck content={platformContent[activeTab]} />
                </div>
            </div>
        </div>
    );
};

export default SocialComposer;