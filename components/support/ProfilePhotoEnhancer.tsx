import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useLocalization } from '../../hooks/useLocalization';

const ProfilePhotoEnhancer: React.FC = () => {
    const { t } = useLocalization();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [style, setStyle] = useState<'corporate' | 'modern' | 'friendly'>('corporate');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setEnhancedImage(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEnhance = async () => {
        if (!selectedImage || !process.env.API_KEY) return;
        setIsProcessing(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Extract base64 data (remove data:image/png;base64, prefix)
            const base64Data = selectedImage.split(',')[1];
            const mimeType = selectedImage.split(';')[0].split(':')[1];

            let stylePrompt = "";
            switch(style) {
                case 'corporate':
                    stylePrompt = "Generate a professional corporate headshot of this person. Dark suit, neutral grey studio background, serious but approachable expression, high contrast, 8k resolution photorealistic.";
                    break;
                case 'modern':
                    stylePrompt = "Generate a modern business portrait of this person. Smart casual attire (blazer, no tie), blurred modern office background, bright lighting, confident smile, 4k resolution photorealistic.";
                    break;
                case 'friendly':
                    stylePrompt = "Generate a warm and friendly insurance agent headshot of this person. Approachable, soft lighting, outdoor blurred background with greenery, inviting smile, photorealistic.";
                    break;
            }

            const prompt = `${stylePrompt} Maintain facial identity strongly. Improve lighting and skin texture. Output a high quality image.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: mimeType } },
                        { text: prompt }
                    ]
                },
                config: {
                    imageConfig: {
                        aspectRatio: '1:1'
                    }
                }
            });

            // Parse response for image
            let imageFound = false;
            if (response.candidates && response.candidates[0].content.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const newBase64 = part.inlineData.data;
                        const newMime = part.inlineData.mimeType || 'image/png';
                        setEnhancedImage(`data:${newMime};base64,${newBase64}`);
                        imageFound = true;
                        break;
                    }
                }
            }

            if (!imageFound) {
               // Fallback check if model returns just text description
               const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
               if (textPart) {
                   console.warn("AI returned text:", textPart.text);
                   setError("AI returned a description instead of an image. Please try a different photo.");
               } else {
                   setError("Failed to generate image. Please try again.");
               }
            }

        } catch (err) {
            console.error("Enhancement error:", err);
            setError("An error occurred during processing. Please check your API key and quota.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('support.photoTool.title')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('support.photoTool.description')}</p>
                </div>
            </div>

            <div className="flex-grow flex flex-col gap-6 items-center justify-center py-4">
                {/* Image Previews Container */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
                    {/* Upload / Original */}
                    <div className="flex flex-col items-center gap-2">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-500 transition overflow-hidden bg-gray-50 dark:bg-gray-900 relative group"
                        >
                            {selectedImage ? (
                                <>
                                    <img src={selectedImage} alt="Original" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <span className="text-white text-xs font-bold">Change</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-gray-400 p-2">
                                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    <span className="text-[10px] font-medium">{t('support.photoTool.upload')}</span>
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Original</span>
                    </div>

                    {/* Arrow for desktop, hidden on mobile if needed or styled vertically */}
                    <div className="text-gray-300 dark:text-gray-600 transform rotate-90 sm:rotate-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>

                    {/* Action / Result */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 ${enhancedImage ? 'border-green-500 shadow-xl' : 'border-gray-200 dark:border-gray-700'} flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-400 relative overflow-hidden`}>
                            {isProcessing ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
                                        <span className="text-[10px] font-bold text-blue-600 animate-pulse">AI Magic...</span>
                                    </div>
                                </div>
                            ) : enhancedImage ? (
                                <div className="w-full h-full relative group">
                                    <img src={enhancedImage} alt="Enhanced" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <a href={enhancedImage} download="professional-headshot.png" className="text-white font-bold text-xs bg-green-600 px-3 py-1 rounded hover:bg-green-700 transition">Download</a>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-xs">AI Result</span>
                            )}
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Professional</span>
                    </div>
                </div>
            </div>

            {error && <p className="text-center text-red-500 text-xs mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}

            <div className="mt-auto pt-6 border-t dark:border-gray-700 flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setStyle('corporate')} className={`py-2 text-[10px] sm:text-xs font-medium rounded-md border transition ${style === 'corporate' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50'}`}>
                        {t('support.photoTool.styles.corporate')}
                    </button>
                    <button onClick={() => setStyle('modern')} className={`py-2 text-[10px] sm:text-xs font-medium rounded-md border transition ${style === 'modern' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50'}`}>
                        {t('support.photoTool.styles.modern')}
                    </button>
                    <button onClick={() => setStyle('friendly')} className={`py-2 text-[10px] sm:text-xs font-medium rounded-md border transition ${style === 'friendly' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50'}`}>
                        {t('support.photoTool.styles.friendly')}
                    </button>
                </div>
                <button 
                    onClick={handleEnhance}
                    disabled={!selectedImage || isProcessing}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isProcessing ? 'Polishing...' : (
                        <>
                            <span>✨</span> {t('support.photoTool.generate')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProfilePhotoEnhancer;