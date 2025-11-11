
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { DetailedPolicy, GapAnalysisResult } from '../types';
import FileUploader from '../components/gap-analysis/FileUploader';
import PolicyParser from '../components/gap-analysis/PolicyParser';
import PolicyReviewForm from '../components/gap-analysis/PolicyReviewForm';
import GapAnalysisResults from '../components/gap-analysis/GapAnalysisResults';
import ErrorMessage from '../components/ui/ErrorMessage';
import { GoogleGenAI, Type } from '@google/genai';
import { fetchParsedPolicy } from '../services/api';

const GapAnalysis: React.FC = () => {
    const { t } = useLocalization();
    const [file, setFile] = useState<File | null>(null);
    const [parsedPolicy, setParsedPolicy] = useState<DetailedPolicy | null>(null);
    const [userNeeds, setUserNeeds] = useState('');
    const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setError(null);
        setParsedPolicy(null);
        setAnalysisResult(null);
        setIsLoading(true);
        setLoadingStep(t('gapAnalysis.fetchingPolicy') as string);

        try {
            // In a real app, this would involve sending the file to a backend for parsing.
            // Here, we simulate it and get mock data.
            const policyData = await fetchParsedPolicy();
            setParsedPolicy(policyData);
        } catch (err) {
            setError(t('gapAnalysis.errors.parsingFailed') as string);
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    };

    const handleAnalyzeGaps = async () => {
        if (!parsedPolicy || !userNeeds || !process.env.API_KEY) {
            setError(t('gapAnalysis.errors.missingInfo') as string);
            return;
        }

        setError(null);
        setIsLoading(true);
        setLoadingStep(t('gapAnalysis.analyzing') as string);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
              Perform a gap analysis for an insurance policy.
              Current Policy Details: ${JSON.stringify(parsedPolicy)}
              Client's Stated Needs: "${userNeeds}"
              
              Identify gaps in coverage, upsell opportunities (e.g., higher limits), and cross-sell opportunities (e.g., new policy types).
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            gaps: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        area: { type: Type.STRING },
                                        current: { type: Type.STRING },
                                        recommended: { type: Type.STRING },
                                        reason: { type: Type.STRING },
                                    },
                                    required: ["area", "current", "recommended", "reason"],
                                },
                            },
                            upsell_opportunities: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        product: { type: Type.STRING },
                                        recommendation: { type: Type.STRING },
                                        benefit: { type: Type.STRING },
                                    },
                                    required: ["product", "recommendation", "benefit"],
                                },
                            },
                            cross_sell_opportunities: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        product: { type: Type.STRING },
                                        recommendation: { type: Type.STRING },
                                        benefit: { type: Type.STRING },
                                    },
                                    required: ["product", "recommendation", "benefit"],
                                },
                            },
                        },
                         required: ["gaps", "upsell_opportunities", "cross_sell_opportunities"],
                    }
                }
            });

            const jsonStr = response.text;
            const result = JSON.parse(jsonStr) as GapAnalysisResult;
            setAnalysisResult(result);
        } catch (err) {
            console.error("AI analysis error:", err);
            setError(t('gapAnalysis.errors.analysisFailed') as string);
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('gapAnalysis.title') as string}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">{t('gapAnalysis.description') as string}</p>

            <FileUploader onFileUpload={handleFileUpload} error={error} />
            {loadingStep && (
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>{loadingStep}</p>
                </div>
            )}
            
            {error && !loadingStep && <ErrorMessage message={error} />}

            {parsedPolicy && !analysisResult && (
                <>
                    <PolicyParser parsedPolicy={parsedPolicy} isLoading={isLoading} />
                    <PolicyReviewForm userNeeds={userNeeds} setUserNeeds={setUserNeeds} onSubmit={handleAnalyzeGaps} isLoading={isLoading} />
                </>
            )}
            
            {analysisResult && (
                 <div className="mt-8">
                    <GapAnalysisResults result={analysisResult} />
                </div>
            )}
        </div>
    );
};

export default GapAnalysis;
