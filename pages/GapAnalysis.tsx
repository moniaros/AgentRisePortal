import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { DetailedPolicy, GapAnalysisResult } from '../types';
import FileUploader from '../components/gap-analysis/FileUploader';
import PolicyParser from '../components/gap-analysis/PolicyParser';
import PolicyReviewForm from '../components/gap-analysis/PolicyReviewForm';
import { GoogleGenAI, Type } from '@google/genai';
import { fetchParsedPolicy } from '../services/api';
import GapAnalysisResults from '../components/gap-analysis/GapAnalysisResults';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { trackEvent } from '../services/analytics';

const GapAnalysis: React.FC = () => {
    const { t, language } = useLocalization();
    const { markTaskCompleted } = useOnboardingStatus();
    const [file, setFile] = useState<File | null>(null);
    const [parsedPolicy, setParsedPolicy] = useState<DetailedPolicy | null>(null);
    const [userNeeds, setUserNeeds] = useState('');
    const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setParsedPolicy(null);
        setAnalysisResult(null);
        setError(null);
        setIsLoading(true);
        setLoadingStep(t('gapAnalysis.fetchingPolicy') as string);

        try {
            // Instead of parsing, we fetch the mock structured data
            const policyData = await fetchParsedPolicy();
            setParsedPolicy(policyData);
        } catch (err) {
            console.error("Error fetching policy:", err);
            setError("Failed to fetch the policy details. Please try again.");
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    };

    const handleAnalyzeGaps = async () => {
        if (!parsedPolicy || !userNeeds || !process.env.API_KEY) return;
        
        setIsLoading(true);
        setLoadingStep(t('gapAnalysis.analyzing') as string);
        setAnalysisResult(null);
        setError(null);

        try {
            // FIX: Use correct Gemini API initialization
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
              Perform a gap analysis for an insurance policy.
              Current Policy Details: ${JSON.stringify(parsedPolicy)}
              Customer Needs & Context: "${userNeeds}"
              
              Based on the customer's needs, identify gaps, upsell opportunities, and cross-sell opportunities.
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
                                    required: ["area", "current", "recommended", "reason"]
                                }
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
                                    required: ["product", "recommendation", "benefit"]
                                }
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
                                    required: ["product", "recommendation", "benefit"]
                                }
                            }
                        },
                        required: ["gaps", "upsell_opportunities", "cross_sell_opportunities"]
                    }
                }
            });
            
            // FIX: Use the `.text` accessor for the response
            const jsonStr = response.text;
            const result = JSON.parse(jsonStr) as GapAnalysisResult;
            setAnalysisResult(result);
            trackEvent(
                'engagement',
                'AI Tools',
                'gap_analysis_success',
                file?.name,
                language
            );
            markTaskCompleted('policyAnalyzed'); // Mark task as complete on successful analysis

        } catch (err) {
            console.error("Error analyzing gaps:", err);
            setError("Failed to perform gap analysis with AI. Please try again.");
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('nav.gapAnalysis') as string}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('gapAnalysis.description') as string}</p>

            {!file && <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading} />}
            
            {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

            {file && <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Uploaded: <strong>{file.name}</strong></p>}
            
            <PolicyParser parsedPolicy={parsedPolicy} isLoading={isLoading && loadingStep === t('gapAnalysis.fetchingPolicy')} />

            {parsedPolicy && (
                <PolicyReviewForm 
                    userNeeds={userNeeds}
                    setUserNeeds={setUserNeeds}
                    onSubmit={handleAnalyzeGaps}
                    isLoading={isLoading && loadingStep === t('gapAnalysis.analyzing')}
                />
            )}
            
            {isLoading && loadingStep && (
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>{loadingStep}</p>
                </div>
            )}
            
            {analysisResult && (
                 <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">{t('gapAnalysis.resultsTitle') as string}</h2>
                    <GapAnalysisResults result={analysisResult} />
                </div>
            )}
        </div>
    );
};

export default GapAnalysis;