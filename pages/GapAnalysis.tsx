import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
// FIX: Correct import path
import { DetailedPolicy, GapAnalysisResult } from '../types';
import FileUploader from '../components/gap-analysis/FileUploader';
import PolicyReviewForm from '../components/gap-analysis/PolicyReviewForm';
import GapAnalysisResults from '../components/gap-analysis/GapAnalysisResults';
import { parsePolicyDocument, analyzePolicyGaps } from '../services/geminiClient';
import { trackEvent } from '../services/analytics';
import { useNotification } from '../hooks/useNotification';
import { savePendingFindings } from '../services/findingsStorage';
import DataReviewModal from '../components/gap-analysis/DataReviewModal';
import { logAuditEvent } from '../services/auditLog';
import { fileToBase64 } from '../services/utils';

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

        setIsLoading(true);
        setLoadingStep(t('gapAnalysis.fetchingPolicy'));

        try {
            // Convert file to base64 for server-side Gemini endpoint
            const base64Data = await fileToBase64(uploadedFile);
            
            const prompt = `
                You are an expert insurance policy parser. Analyze the provided document (image or PDF) and extract the policy details into a structured JSON format.
                
                Extract the following fields accurately:
                - Policy Number
                - Insurer Name
                - Policyholder Name and Address
                - Effective Date and Expiration Date (Format: YYYY-MM-DD)
                - Insured Items (e.g., Vehicle description, Property address)
                - Coverages (Type, Limit, Deductible, Premium if available)
                
                If specific values are missing, use null or an empty string. Do not hallucinate data.
            `;
            
            const policyData = await parsePolicyDocument({
                base64Data,
                mimeType: uploadedFile.type,
                prompt,
            });
            
            // Open the review modal instead of setting the policy directly
            setDataForReview(policyData);
            setReviewModalOpen(true);
            trackEvent('ai_tool', 'Gap Analysis', 'policy_parsed_success', undefined, language);
            
            logAuditEvent('policy_parse', uploadedFile.name, 'Successfully extracted data from document.');

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
        logAuditEvent('policy_review_approved', approvedPolicy.policyNumber, 'User verified and approved extracted policy data.');
    };

    const handleAnalyzeGaps = async () => {
        if (!parsedPolicy || !userNeeds || !file) return;

        setIsLoading(true);
        setLoadingStep(t('gapAnalysis.analyzing'));
        setError(null);
        setAnalysisResult(null);

        try {
            // Determine prompt language
            const targetLang = language === 'el' ? 'Greek' : 'English';

            const prompt = `
              Role: You are a World-Class Senior Underwriter and High-Performance Sales Coach.
              Task: Perform a rigorous Risk Gap Analysis on the provided insurance policy.
              
              Input Data:
              - Policy Details: ${JSON.stringify(parsedPolicy)}
              - Client Context & Goals: "${userNeeds}"
              
              Output Requirements (${targetLang}):
              1. Risk Score (0-100): Calculate a risk score where 100 is High Risk/Dangerous and 0 is Fully Protected. Based on coverage gaps vs needs.
              2. Executive Summary: A punchy, 2-sentence overview of their risk profile.
              3. Coverage Gaps: Identify specific dangers. For each, estimate:
                 - 'financialImpact': Potential loss amount in Euros (e.g., '€50,000 potential loss').
                 - 'costOfImplementation': Estimated annual premium cost to fix this gap (e.g., '€150/year').
                 - 'Cost of Inaction': A brief phrase describing the dire consequence.
              
              4. OPPORTUNITY CATEGORIZATION RULES:
                 - UPSELL: Improvements to the CURRENT policy (e.g., adding Glass Breakage to Auto, Lowering Deductible on Home, Increasing Liability Limits).
                 - CROSS-SELL: Selling a NEW, SEPARATE policy based on lifestyle inference.
                    - If Policy is AUTO: Suggest Home (Renters/Owners), Life (Driver Safety), or Personal Accident.
                    - If Policy is HOME: Suggest Auto, Earthquake (if missing), or Umbrella Liability.
                    - If Policy is LIFE: Suggest Health or Critical Illness.
                 - For every Cross-Sell/Upsell, estimate the 'costOfImplementation' (Annual Premium) vs the 'financialImpact' (Coverage Amount).

              5. Sales Scripts: Write a specific, psychological script for the agent to say to the client to close the gap. Use fear of loss or peace of mind logic.
              6. Priority: Tag each finding as 'Critical', 'High', or 'Medium'.

              Ensure the tone is professional, authoritative, yet persuasive.
            `;

            const result = await analyzePolicyGaps(prompt);
            setAnalysisResult(result);
            trackEvent('ai_tool', 'Gap Analysis', 'analysis_success', undefined, language);

            const customerId = parsedPolicy.policyholder.name.replace(/\s+/g, '_').toLowerCase();
            const analysisId = `analysis_${Date.now()}`;
            savePendingFindings(customerId, analysisId, result);
            addNotification(t('gapAnalysis.saveSuccess'), 'success');
            
            logAuditEvent('gap_analysis_run', parsedPolicy.policyNumber, `Risk Score: ${result.riskScore}`);

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
                <div className="mt-8">
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
