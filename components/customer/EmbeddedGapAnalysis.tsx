import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Customer, DetailedPolicy, GapAnalysisResult } from '../../types';
import FileUploader from '../gap-analysis/FileUploader';
import { GoogleGenAI, Type } from '@google/genai';
import { fetchParsedPolicy } from '../../services/api';
import { useCrmData } from '../../hooks/useCrmData';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../ui/ErrorMessage';
import { mapToPolicyACORD } from '../../services/acordMapper';
import { savePolicyForCustomer } from '../../services/policyStorage';
import { useNotification } from '../../hooks/useNotification';

interface EmbeddedGapAnalysisProps {
    customer: Customer;
}

const EmbeddedGapAnalysis: React.FC<EmbeddedGapAnalysisProps> = ({ customer }) => {
    const { t } = useLocalization();
    const { addTimelineEvent } = useCrmData();
    const { currentUser } = useAuth();
    const { addNotification } = useNotification();

    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult | null>(null);

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setError(null);
        setAnalysisResult(null);

        if (!process.env.API_KEY) {
            setError("API Key not configured.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. "Parse" the policy
            setLoadingStep(t('gapAnalysis.fetchingPolicy'));
            const policyData = await fetchParsedPolicy();
            
            // Map and save the parsed policy to localStorage
            const acordPolicy = mapToPolicyACORD(policyData);
            savePolicyForCustomer(customer.id, acordPolicy);
            addNotification('Policy data saved to local storage.', 'info');

            // 2. Analyze for gaps
            setLoadingStep(t('gapAnalysis.analyzing'));
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
              Perform a gap analysis for an insurance policy for customer: ${customer.firstName} ${customer.lastName}.
              Current Policy Details: ${JSON.stringify(policyData)}
              Customer Context: Analyze for potential cross-sell or upsell opportunities.
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
            
            // 3. Add to timeline
            addTimelineEvent(customer.id, {
                type: 'system',
                content: `AI policy analysis completed for uploaded file "${uploadedFile.name}". Found ${result.gaps.length} gaps, ${result.upsell_opportunities.length} upsell, and ${result.cross_sell_opportunities.length} cross-sell opportunities.`,
                author: currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System',
            });

        } catch (err) {
            console.error("Error in embedded analysis:", err);
            setError("Failed to perform analysis. Please try again.");
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    };

    return (
        <div className="border dark:border-gray-700 rounded-lg p-4">
            {!file && !isLoading && <FileUploader onFileUpload={handleFileUpload} error={null} />}
            
            {isLoading && (
                 <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p className="text-sm">{loadingStep}</p>
                </div>
            )}
            
            {!isLoading && file && (
                <div className="space-y-3">
                    <p className="text-sm">Analysis complete for: <strong>{file.name}</strong></p>
                    {error && <ErrorMessage message={error} />}
                    {analysisResult && (
                        <div className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                            Analysis saved to timeline.
                        </div>
                    )}
                    <button onClick={() => setFile(null)} className="text-sm text-blue-500 hover:underline">Analyze another document</button>
                </div>
            )}

        </div>
    );
};

export default EmbeddedGapAnalysis;