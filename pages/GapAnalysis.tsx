import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
// FIX: Correct import path
import { DetailedPolicy, GapAnalysisResult } from '../types';
import FileUploader from '../components/gap-analysis/FileUploader';
import PolicyReviewForm from '../components/gap-analysis/PolicyReviewForm';
import GapAnalysisResults from '../components/gap-analysis/GapAnalysisResults';
import { GoogleGenAI, Type } from "@google/genai";
import { trackEvent } from '../services/analytics';
import { useNotification } from '../hooks/useNotification';
import { savePendingFindings } from '../services/findingsStorage';
import DataReviewModal from '../components/gap-analysis/DataReviewModal';

const GapAnalysis: React.FC = () => {
    const { t, language } = useLocalization();
    const { addNotification } = useNotification();
    const [file, setFile] = useState<File | null>(null);
    const [dataForReview, setDataForReview] = useState<DetailedPolicy | null>(null);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
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
        setDataForReview(null);
        
        if (!process.env.API_KEY) {
            const errorMsg = t('dashboard.errors.noApiKey');
            setError(errorMsg);
            addNotification(errorMsg, 'error');
            return;
        }

        setIsLoading(true);
        setLoadingStep(t('gapAnalysis.fetchingPolicy'));

        try {
            // STEP 1: In a real app, this would be OCR. We are using mocked text from the example PDF.
            const ocrText = `
                ΕΘΝΙΚΗ Η ΠΡΩΤΗ ΑΣΦΑΛΙΣΤΙΚΗ
                ΠΟΛΥΑΣΦΑΛΙΣΤΗΡΙΟ ΣΥΜΒΟΛΑΙΟ ΚΛΑΔΟΥ ΑΥΤΟΚΙΝΗΤΩΝ
                Αρ. Συμβολαίου: 63708952
                Διάρκεια Ασφάλισης: Ετήσιο
                Από: 23:59 της 11/07/2025 Εως: 23:59 της 11/07/2026
                ΑΣΦΑΛΙΖΟΜΕΝΟΣ/ΛΗΠΤΗΣ ΑΣΦΑΛΙΣΗΣ
                Επώνυμο: ΜΟΝΙΑΡΟΣ
                Όνομα: ΙΩΑΝΝΗΣ
                Δ/νση: ΦΟΛΕΓΑΝΔΡΟΥ 11, 16561 ΓΛΥΦΑΔΑ
                ΣΤΟΙΧΕΙΑ ΑΣΦΑΛΙΣΜΕΝΟΥ ΟΧΗΜΑΤΟΣ
                Μάρκα: FIAT
                Μοντέλο: 500X (334) CROS
                ΟΙ ΚΑΛΥΨΕΙΣ ΣΑΣ
                [1] Σωματικές Βλάβες τρίτων (ανά άτομο) 1.300.000€
                Υλικές Ζημιές τρίτων (ανά ατύχημα) 1.300.000€
                Προσωπικό Ατύχημα Οδηγού 15.000€
            `;
            
            // STEP 2: Use Gemini to parse the OCR text
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `
                You are an expert insurance policy parser. Analyze the following text extracted from an insurance policy document and return the data in a structured JSON format.
                Explicitly extract the policy number, insurer name, policyholder's full name and address, the policy effective date, and the policy expiration date.
                Also, extract the main insured item (like a vehicle or property) and list its coverages with their corresponding limits.
                
                Policy Text:
                ---
                ${ocrText}
                ---
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            policyNumber: { type: Type.STRING },
                            insurer: { type: Type.STRING },
                            policyholder: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    address: { type: Type.STRING },
                                },
                                required: ["name", "address"],
                            },
                            effectiveDate: { type: Type.STRING, description: "The policy start date in YYYY-MM-DD format." },
                            expirationDate: { type: Type.STRING, description: "The policy end date in YYYY-MM-DD format." },
                            insuredItems: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        coverages: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    type: { type: Type.STRING },
                                                    limit: { type: Type.STRING },
                                                },
                                                required: ["type", "limit"],
                                            },
                                        },
                                    },
                                    required: ["id", "description", "coverages"],
                                },
                            },
                        },
                        required: ["policyNumber", "insurer", "policyholder", "effectiveDate", "expirationDate", "insuredItems"],
                    },
                }
            });
            
            const policyData = JSON.parse(response.text) as DetailedPolicy;
            
            // Open the review modal instead of setting the policy directly
            setDataForReview(policyData);
            setReviewModalOpen(true);
            trackEvent('ai_tool', 'Gap Analysis', 'policy_parsed_success', undefined, language);

        } catch (err) {
            console.error("Error parsing policy:", err);
            setError(t('gapAnalysis.errors.parsingFailed'));
            trackEvent('ai_tool', 'Gap Analysis', 'policy_parsed_error', (err as Error).message, language);
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    };

    const handleReviewApproved = (approvedPolicy: DetailedPolicy) => {
        setParsedPolicy(approvedPolicy);
        setReviewModalOpen(false);
    };

    const handleAnalyzeGaps = async () => {
        if (!parsedPolicy || !userNeeds || !file) return;
        
        if (!process.env.API_KEY) {
            setError(t('dashboard.errors.noApiKey'));
            addNotification(t('dashboard.errors.noApiKey'), 'error');
            return;
        }

        setIsLoading(true);
        setLoadingStep(t('gapAnalysis.analyzing'));
        setError(null);
        setAnalysisResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
              Perform a gap analysis for an insurance policy.
              Current Policy Details: ${JSON.stringify(parsedPolicy)}
              Customer Needs & Context: "${userNeeds}"
              
              Based on the needs and the current policy, identify:
              1. Coverage Gaps: Areas where the current policy is insufficient.
              2. Upsell Opportunities: Enhancements to existing coverages.
              3. Cross-sell Opportunities: New types of policies the customer might need.

              Provide a detailed reason for each finding.
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
                                description: 'List of coverage gaps identified.',
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        area: { type: Type.STRING, description: 'e.g., Liability Coverage' },
                                        current: { type: Type.STRING, description: 'e.g., €100,000' },
                                        recommended: { type: Type.STRING, description: 'e.g., €300,000' },
                                        reason: { type: Type.STRING, description: 'Reason for the recommendation.' },
                                    },
                                    required: ["area", "current", "recommended", "reason"],
                                },
                            },
                            upsell_opportunities: {
                                type: Type.ARRAY,
                                description: 'List of potential upsell opportunities.',
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        product: { type: Type.STRING, description: 'e.g., Increased Personal Property Limit' },
                                        recommendation: { type: Type.STRING, description: 'Specific recommendation details.' },
                                        benefit: { type: Type.STRING, description: 'Benefit to the customer.' },
                                    },
                                    required: ["product", "recommendation", "benefit"],
                                },
                            },
                            cross_sell_opportunities: {
                                type: Type.ARRAY,
                                description: 'List of potential cross-sell opportunities.',
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        product: { type: Type.STRING, description: 'e.g., Umbrella Policy' },
                                        recommendation: { type: Type.STRING, description: 'Specific recommendation details.' },
                                        benefit: { type: Type.STRING, description: 'Benefit to the customer.' },
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
            trackEvent('ai_tool', 'Gap Analysis', 'analysis_success', undefined, language);

            // Save the findings for agent review
            const customerId = parsedPolicy.policyholder.name.replace(/\s+/g, '_').toLowerCase();
            const analysisId = `analysis_${Date.now()}`;
            savePendingFindings(customerId, analysisId, result);
            addNotification(t('gapAnalysis.saveSuccess'), 'success');

        } catch (err) {
            console.error("Error analyzing gaps:", err);
            setError(t('gapAnalysis.errors.analysisFailed'));
            trackEvent('ai_tool', 'Gap Analysis', 'analysis_error', (err as Error).message, language);
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    };
    
    const resetState = () => {
        setFile(null);
        setParsedPolicy(null);
        setUserNeeds('');
        setAnalysisResult(null);
        setError(null);
        setDataForReview(null);
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('gapAnalysis.title')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">{t('gapAnalysis.subtitle')}</p>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm mb-4">{error}</div>}
                
                {!file && !isLoading && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">{t('gapAnalysis.step1')}</h2>
                        <FileUploader onFileUpload={handleFileUpload} error={error} />
                    </>
                )}

                {(isLoading && loadingStep === t('gapAnalysis.fetchingPolicy')) && (
                    <div className="text-center p-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p>{loadingStep}</p>
                    </div>
                )}
                
                {parsedPolicy && !analysisResult && (
                    <div className="mt-8 pt-8 border-t dark:border-gray-700">
                         <h2 className="text-2xl font-semibold mb-4">{t('gapAnalysis.step2')}</h2>
                         <PolicyReviewForm userNeeds={userNeeds} setUserNeeds={setUserNeeds} onSubmit={handleAnalyzeGaps} isLoading={isLoading && loadingStep === t('gapAnalysis.analyzing')} />
                    </div>
                )}
            </div>

            {analysisResult && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">{t('gapAnalysis.resultsTitle')}</h2>
                        <button onClick={resetState} className="text-sm text-blue-500 hover:underline">{t('gapAnalysis.startOver')}</button>
                    </div>
                    <GapAnalysisResults result={analysisResult} />
                </div>
            )}

            {isReviewModalOpen && dataForReview && (
                <DataReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    policyData={dataForReview}
                    onApprove={handleReviewApproved}
                />
            )}
        </div>
    );
};

export default GapAnalysis;