
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Customer, GapAnalysisResult } from '../../types';
import FileUploader from '../gap-analysis/FileUploader';
import { GoogleGenAI, Type } from '@google/genai';
import { fetchParsedPolicy } from '../../services/api';
import { useCrmData } from '../../hooks/useCrmData';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../ui/ErrorMessage';
import { mapToPolicyACORD } from '../../services/acordMapper';
import { savePolicyForCustomer } from '../../services/policyStorage';
import { useNotification } from '../../hooks/useNotification';
import { savePendingFindings } from '../../services/findingsStorage';
import { saveAnalysisForCustomer } from '../../services/analysisStorage';
import GapAnalysisResults from '../gap-analysis/GapAnalysisResults';

interface EmbeddedGapAnalysisProps {
    customer: Customer;
}

const EmbeddedGapAnalysis: React.FC<EmbeddedGapAnalysisProps> = ({ customer }) => {
    const { t, language } = useLocalization();
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

            // 2. Analyze for gaps using Risk Intelligence Prompt
            setLoadingStep(t('gapAnalysis.analyzing'));
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const targetLang = language === 'el' ? 'Greek' : 'English';

            const prompt = `
              Role: You are a World-Class Senior Underwriter and High-Performance Sales Coach.
              Task: Perform a rigorous Risk Gap Analysis on the provided insurance policy for existing customer: ${customer.firstName} ${customer.lastName}.
              
              Input Data:
              - Policy Details: ${JSON.stringify(policyData)}
              - Customer Profile: ${JSON.stringify({ age: customer.dateOfBirth, address: customer.address, policies: customer.policies.map(p => p.type) })}
              
              Output Requirements (${targetLang}):
              1. Risk Score (0-100): Calculate a risk score where 100 is High Risk/Dangerous and 0 is Fully Protected.
              2. Executive Summary: A punchy, 2-sentence overview of their risk profile.
              3. Coverage Gaps: Identify specific dangers. For each, estimate:
                 - 'financialImpact': Potential loss amount in Euros (e.g., '€50,000 potential loss').
                 - 'costOfImplementation': Estimated annual premium cost to fix this gap (e.g., '€150/year').
                 - 'Cost of Inaction': A brief phrase describing the dire consequence.
              
              4. OPPORTUNITY CATEGORIZATION RULES:
                 - UPSELL: Improvements to the CURRENT policy (e.g., adding Glass Breakage, Lowering Deductible).
                 - CROSS-SELL: Selling a NEW, SEPARATE policy based on lifestyle inference (e.g., Life, Health, Property).
                 - For every opportunity, provide 'costOfImplementation' (Annual Premium) vs 'financialImpact' (Coverage Amount).

              5. Sales Scripts: Write a specific, psychological script for the agent to say to the client.
              6. Priority: Tag each finding as 'Critical', 'High', or 'Medium'.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            riskScore: { type: Type.NUMBER },
                            summary: { type: Type.STRING },
                            gaps: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        area: { type: Type.STRING },
                                        current: { type: Type.STRING },
                                        recommended: { type: Type.STRING },
                                        reason: { type: Type.STRING },
                                        priority: { type: Type.STRING, enum: ["Critical", "High", "Medium"] },
                                        financialImpact: { type: Type.STRING },
                                        costOfImplementation: { type: Type.STRING },
                                        costOfInaction: { type: Type.STRING },
                                        salesScript: { type: Type.STRING },
                                    },
                                    required: ["area", "current", "recommended", "reason", "priority", "financialImpact", "costOfImplementation", "salesScript"],
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
                                        priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                                        financialImpact: { type: Type.STRING },
                                        costOfImplementation: { type: Type.STRING },
                                        salesScript: { type: Type.STRING },
                                    },
                                    required: ["product", "recommendation", "benefit", "salesScript"],
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
                                        priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                                        financialImpact: { type: Type.STRING },
                                        costOfImplementation: { type: Type.STRING },
                                        salesScript: { type: Type.STRING },
                                    },
                                    required: ["product", "recommendation", "benefit", "salesScript"],
                                },
                            },
                        },
                        required: ["riskScore", "summary", "gaps", "upsell_opportunities", "cross_sell_opportunities"],
                    }
                }
            });

            let jsonStr = response.text;
            if (!jsonStr) throw new Error("No response from AI");
            if (jsonStr.includes('```json')) {
                jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
            }

            const result = JSON.parse(jsonStr) as GapAnalysisResult;
            setAnalysisResult(result);
            
            // 3. Save findings for agent review & Save full analysis to history
            const analysisId = `analysis_${Date.now()}`;
            savePendingFindings(customer.id, analysisId, result);
            
            saveAnalysisForCustomer(customer.id, {
                fileName: uploadedFile.name,
                parsedPolicy: policyData,
                analysisResult: result,
            });

            addNotification(t('gapAnalysis.saveSuccess'), 'success');

            // 4. Add a timeline event to notify the agent
            addTimelineEvent(customer.id, {
                type: 'system',
                content: `AI Risk Intelligence Scan completed for "${uploadedFile.name}". Risk Score: ${result.riskScore}/100.`,
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
        <div className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
            {!file && !isLoading && (
                <div>
                    <FileUploader onFileUpload={handleFileUpload} error={null} />
                </div>
            )}
            
            {isLoading && (
                 <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{loadingStep}</p>
                </div>
            )}
            
            {!isLoading && file && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-sm font-semibold">Analysis for: <strong>{file.name}</strong></p>
                        <button onClick={() => setFile(null)} className="text-sm text-blue-600 hover:underline">Scan New Document</button>
                    </div>
                    
                    {error && <ErrorMessage message={error} />}
                    
                    {analysisResult && (
                        <div className="mt-4">
                            <div className="p-3 mb-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm rounded border border-green-200 dark:border-green-800">
                                ✔ {t('gapAnalysis.saveSuccess')}
                            </div>
                            <GapAnalysisResults result={analysisResult} />
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default EmbeddedGapAnalysis;