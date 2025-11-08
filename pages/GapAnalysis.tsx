import React, { useState } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { useLocalization } from '../hooks/useLocalization';
import { Policy } from '../types';
import FileUploader from '../components/gap-analysis/FileUploader';
import PolicyParser from '../components/gap-analysis/PolicyParser';
import PolicyReviewForm from '../components/gap-analysis/PolicyReviewForm';

// Helper to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const GapAnalysis: React.FC = () => {
    const { t } = useLocalization();
    const [file, setFile] = useState<File | null>(null);
    const [parsedPolicy, setParsedPolicy] = useState<Partial<Policy> | null>(null);
    const [userNeeds, setUserNeeds] = useState('');
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setParsedPolicy(null);
        setAnalysisResult(null);
        setError(null);
        setIsLoading(true);

        try {
            // FIX: Initialize GoogleGenAI with API key from environment variables.
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            const imagePart = await fileToGenerativePart(uploadedFile);

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    policyNumber: { type: Type.STRING },
                    insurer: { type: Type.STRING },
                    premium: { type: Type.NUMBER },
                    startDate: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                    endDate: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                }
            };

            const prompt = t('gapAnalysis.parsingPrompt');

            // FIX: Use ai.models.generateContent to generate content.
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: prompt }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });

            // FIX: Access the 'text' property directly from the response.
            const text = response.text;
            const parsedJson: Partial<Policy> = JSON.parse(text);
            setParsedPolicy(parsedJson);

        } catch (err) {
            console.error("Error during policy parsing:", err);
            setError(err instanceof Error ? err.message : t('gapAnalysis.parsingError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!parsedPolicy || !userNeeds) return;

        setIsLoading(true);
        setAnalysisResult(null);
        setError(null);

        try {
            // FIX: Initialize GoogleGenAI with API key from environment variables.
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            const prompt = `${t('gapAnalysis.analysisPrompt')}
            
            Policy Details: ${JSON.stringify(parsedPolicy, null, 2)}
            
            User Needs: ${userNeeds}
            `;

            // FIX: Use ai.models.generateContent to generate content.
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            // FIX: Access the 'text' property directly from the response.
            setAnalysisResult(response.text);

        } catch (err) {
            console.error("Error during gap analysis:", err);
            setError(err instanceof Error ? err.message : t('gapAnalysis.analysisError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('gapAnalysis.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('gapAnalysis.description')}</p>
            
            <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading && !parsedPolicy} />
            
            {error && <div className="mt-4 text-red-500 bg-red-100 dark:bg-red-900 p-3 rounded-md">{error}</div>}

            <PolicyParser parsedPolicy={parsedPolicy} isLoading={isLoading && !parsedPolicy} />

            {parsedPolicy && (
                <PolicyReviewForm 
                    userNeeds={userNeeds}
                    setUserNeeds={setUserNeeds}
                    onSubmit={handleAnalyze}
                    isLoading={isLoading && !!analysisResult === false}
                />
            )}
            
            {isLoading && analysisResult === null && parsedPolicy && (
                 <div className="text-center p-8 mt-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>{t('gapAnalysis.analyzing')}</p>
                 </div>
            )}

            {analysisResult && (
                <div className="mt-8 bg-green-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-semibold mb-4 text-green-800 dark:text-green-300">{t('gapAnalysis.analysisComplete')}</h3>
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{analysisResult}</div>
                </div>
            )}
        </div>
    );
};

export default GapAnalysis;
