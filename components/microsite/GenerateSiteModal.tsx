import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { GoogleGenAI } from '@google/genai';
import { MicrositeBlock } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useCrmData } from '../../hooks/useCrmData';
import { useNewsData } from '../../hooks/useNewsData';
import { useTestimonialsData } from '../../hooks/useTestimonialsData';

interface GenerateSiteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (blocks: MicrositeBlock[]) => void;
}

const GenerateSiteModal: React.FC<GenerateSiteModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { customers } = useCrmData();
    const { articles } = useNewsData();
    const { testimonials } = useTestimonialsData();

    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-populate prompt with database data when modal opens
    useEffect(() => {
        if (isOpen) {
            const productsSet = new Set<string>();
            customers.forEach(c => c.policies.forEach(p => productsSet.add(p.type)));
            const productsList = Array.from(productsSet)
                .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                .join(', ');

            const agentName = currentUser?.party.partyName 
                ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` 
                : 'Agent';
            
            const contactEmail = currentUser?.party.contactInfo.email || 'contact@agency.com';
            const contactPhone = currentUser?.party.contactInfo.workPhone || '555-0123';
            const address = currentUser?.party.addressInfo?.fullAddress || 'Main St, City';
            
            // Use a generic agency name if not specifically set in user profile (mock assumption)
            const agencyName = 'Prime Guard Insurance'; 

            const recentHeadlines = articles.slice(0, 3).map(a => `"${a.title}"`).join(', ');
            const testimonialCount = testimonials.length;

            const suggestion = `Create a professional, high-converting website for "${agencyName}", located at ${address}.
Key Personnel: Led by experienced agent ${agentName}.
Contact: ${contactEmail}, ${contactPhone}.

Our Core Offerings: ${productsList || 'Auto, Home, Life, Business'}.

Agency Highlights:
- We have ${testimonialCount} verified 5-star client testimonials.
- We actively publish industry insights, recently covering: ${recentHeadlines || 'Risk Management, Policy Updates'}.

Target Audience: Families, Homeowners, and Small Business Owners seeking personalized coverage.
Tone: Trustworthy, Professional, Community-Oriented, and Responsive.`;

            setPrompt(suggestion);
        }
    }, [isOpen, currentUser, customers, articles, testimonials]);

    const handleGenerate = async () => {
        if (!prompt || !process.env.API_KEY) return;

        setIsGenerating(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const systemInstruction = `
                You are an expert web designer for the insurance industry. 
                Generate a JSON array of MicrositeBlocks based on the user's agency description.
                
                The available block types and their structures are:
                - hero: { id: string, type: 'hero', title: string, subtitle: string, ctaText: string, imageUrl: string }
                - about: { id: string, type: 'about', title: string, content: string, imageUrl: string }
                - services: { id: string, type: 'services', title: string, services: [{ id: string, name: string, description: string, icon: string }] }
                - testimonials: { id: string, type: 'testimonials', title: string, testimonials: [{ id: string, quote: string, author: string }] }
                - contact: { id: string, type: 'contact', title: string, subtitle: string }
                - faq: { id: string, type: 'faq', title: string, items: [{ id: string, question: string, answer: string }] }

                Rules:
                1. Generate a complete landing page structure (Hero -> Services -> About -> Testimonials -> FAQ -> Contact).
                2. Use professional, persuasive copywriting tailored to the user's prompt.
                3. Use unsplash source URLs for images with relevant keywords (e.g., 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80').
                4. Return ONLY the JSON array. No markdown formatting.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: 'application/json',
                }
            });

            let jsonStr = response.text;
            // Sanitize JSON if the model returns markdown blocks
            if (jsonStr) {
                jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
            }

            const blocks = JSON.parse(jsonStr || '[]');
            
            // Ensure unique IDs
            const validBlocks = blocks.map((b: any) => ({
                ...b,
                id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }));

            onGenerate(validBlocks);
            onClose();

        } catch (err: any) {
            console.error("Site generation failed:", err);
            let errorMessage = "Failed to generate site. Please try again.";
            
            // Robust check for Quota Exceeded / 429 Resource Exhausted
            if (
                err.status === 429 || 
                err.response?.status === 429 || 
                err.error?.code === 429 ||
                err.message?.includes('429') || 
                err.message?.includes('RESOURCE_EXHAUSTED') ||
                err.message?.includes('quota')
            ) {
                errorMessage = "AI Usage Limit Reached (Quota Exceeded). Please try again later.";
            }
            
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">✨</span> AI Site Generator
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        We've pre-filled this prompt with your agency's data. Edit it to refine the result.
                    </p>
                </div>
                <div className="p-6 space-y-4">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 h-64 focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed font-mono"
                        placeholder="Describe your agency..."
                    />
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
                    <button onClick={onClose} disabled={isGenerating} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating || !prompt} 
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Building...
                            </>
                        ) : (
                            <>
                                <span>🪄</span> Generate Site
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GenerateSiteModal;