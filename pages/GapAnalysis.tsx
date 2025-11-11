import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { DetailedPolicy, GapAnalysisResult } from '../types';
import FileUploader from '../components/gap-analysis/FileUploader';
import PolicyParser from '../components/gap-analysis/PolicyParser';
import PolicyReviewForm from '../components/gap-analysis/PolicyReviewForm';
import { GoogleGenAI, Type } from '@google/genai';
import GapAnalysisResults from '../components/gap-analysis/GapAnalysisResults';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { trackEvent } from '../services/analytics';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

// The OCR'd text from the provided example policy document
const POLICY_DOCUMENT_TEXT = `
ΕΘΝΙΚΗ
Η ΠΡΩΤΗ ΑΣΦΑΛΙΣΤΙΚΗ
ΑΝΩΝΥΜΟΣ ΕΛΛΗΝΙΚΗ ΕΤΑΙΡΙΑ ΓΕΝΙΚΩΝ ΑΣΦΑΛΕΙΩΝ «Η ΕΘΝΙΚΗ»
ΛΕΩΦ. ΣΥΓΓΡΟΥ 103-105 • 117 45 ΑΘΗΝΑ • ΑΦΜ: 094003849
Αρ. Γ.Ε.ΜΗ.: 000224801000 • ΕΞΥΠΗΡΕΤΗΣΗ ΠΕΛΑΤΩΝ ΤΗΛ: +30 210 90 99 000
email: ethniki@insurance.nbg.gr www.ethniki-asfalistiki.gr my.ethniki-asfalistiki.gr
ΠΟΛΥΑΣΦΑΛΙΣΤΗΡΙΟ ΣΥΜΒΟΛΑΙΟ ΚΛΑΔΟΥ ΑΥΤΟΚΙΝΗΤΩΝ
Το παρόν επέχει και θέση απόδειξης πληρωμής ασφαλίστρων
ΤΟ ΣΥΜΒΟΛΑΙΟ ΣΑΣ
Αρ. Συμβολαίου: 63708952
Αρ. Παραστατικού: 18820956
Διάρκεια Ασφάλισης: Ετήσιο
Από: 23:59 της 11/07/2025 Εως: 23:59 της 11/07/2026
+30 210 9099 000
ΜΟΝΙΑΡΟΣ ΙΩΑΝΝΗΣ ΧΡΗΣΤ
ΦΟΛΕΓΑΝΔΡΟΥ 11
16561 ΓΛΥΦΑΔΑ
ΑΣΦΑΛΙΖΟΜΕΝΟΣ/ΛΗΠΤΗΣ ΑΣΦΑΛΙΣΗΣ
Επώνυμο: ΜΟΝΙΑΡΟΣ
Όνομα: ΙΩΑΝΝΗΣ
Δ/νση: ΦΟΛΕΓΑΝΔΡΟΥ 11
16561 ΓΛΥΦΑΔΑ
ΣΤΟΙΧΕΙΑ ΑΣΦΑΛΙΣΜΕΝΟΥ ΟΧΗΜΑΤΟΣ
Αρ. Κυκλοφ.: KPT9616
Μάρκα: FIAT
Μοντέλο: 500X (334) CROS
ΟΙ ΚΑΛΥΨΕΙΣ ΣΑΣ
Σωματικές Βλάβες τρίτων (ανά άτομο) - ΑΣΦ. ΚΕΦ. (€) 1.300.000
Υλικές Ζημιές τρίτων (ανά ατύχημα) - ΑΣΦ. ΚΕΦ. (€) 1.300.000
Σωματικές Βλάβες από Μετάδοση Πυρκαγιάς - ΑΣΦ. ΚΕΦ. (€) 15.000
Υλικές Ζημιές από Μετάδοση Πυρκαγιάς - ΑΣΦ. ΚΕΦ. (€) 15.000
Ζημιές Ιδίου από Πλημμύρα Φυσικών Φαινομένων - ΑΣΦ. ΚΕΦ. (€) 15.741
Ζημιές Ιδίου οχήματος από Δασική Πυρκαγιά - ΑΣΦ. ΚΕΦ. (€) 15.741
Προσωπικό Ατύχημα Οδηγού - ΑΣΦ. ΚΕΦ. (€) 15.000
Νομική Προστασία - ΑΣΦ. ΚΕΦ. (€) 15.000
Υλικές Ζημιές Ιδίου Οχήματος από Ανασφάλιστο όχημα - ΑΣΦ. ΚΕΦ. (€) 100.000
Εγγύηση Ασφαλίστρου - ΑΠΑΛΛ. ΙΣΧΥΕΙ
Οδική - Ιατρική & Ταξιδιωτική Βοήθεια - ΑΠΑΛΛ. ΙΣΧΥΕΙ
`;


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

    const resetState = () => {
        setFile(null);
        setParsedPolicy(null);
        setAnalysisResult(null);
        setError(null);
        setIsLoading(false);
        setLoadingStep('');
        setUserNeeds('');
    };

    const handleFileUpload = async (uploadedFile: File) => {
        setError(null);

        if (!ACCEPTED_MIME_TYPES.includes(uploadedFile.type)) {
            setError(`Invalid file type. Please upload a PDF, JPG, or PNG file.`);
            return;
        }

        if (uploadedFile.size > MAX_FILE_SIZE_BYTES) {
            setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }
        
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            setError("Gemini API Key is not configured. Please set it in the Settings page.");
            return;
        }

        setFile(uploadedFile);
        setParsedPolicy(null);
        setAnalysisResult(null);
        setIsLoading(true);
        setLoadingStep(t('gapAnalysis.fetchingPolicy') as string);

        try {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `
              Analyze the following insurance policy document text and extract the key information into a structured JSON format. 
              The document is in Greek. The JSON output must conform to the specified schema.
              For 'insuredItems.id', generate a unique identifier like 'vehicle_1'. 
              For 'insuredItems.description', extract the vehicle's make and model. 
              For 'coverages.type', use the Greek text from the document. 
              For 'coverages.limit', use the value from the 'ΑΣΦ. ΚΕΦ. (€)' column or 'ΙΣΧΥΕΙ' if it's a binary coverage.
              For 'coverages.deductible', use the value from the 'ΑΠΑΛΛ.' column if present, otherwise omit it.
              The policyholder name is 'ΜΟΝΙΑΡΟΣ ΙΩΑΝΝΗΣ ΧΡΗΣΤ' and their address is 'ΦΟΛΕΓΑΝΔΡΟΥ 11, 16561 ΓΛΥΦΑΔΑ'.
              The insurer is 'ΕΘΝΙΚΗ'.
              The policy number is '63708952'.

              Policy Text: 
              ${POLICY_DOCUMENT_TEXT}
            `;

            const schema = {
                type: Type.OBJECT,
                properties: {
                    policyNumber: { type: Type.STRING, description: 'The policy number, Αρ. Συμβολαίου' },
                    insurer: { type: Type.STRING, description: 'The name of the insurance company, e.g., ΕΘΝΙΚΗ' },
                    policyholder: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: 'Full name of the policyholder' },
                            address: { type: Type.STRING, description: 'Full address of the policyholder' },
                        },
                        required: ['name', 'address'],
                    },
                    insuredItems: {
                        type: Type.ARRAY,
                        description: 'List of insured items, typically one vehicle for a motor policy.',
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING, description: "A unique identifier for the item, e.g., 'vehicle_1'" },
                                description: { type: Type.STRING, description: "Description of the item, e.g., 'FIAT 500X (334) CROS'" },
                                coverages: {
                                    type: Type.ARRAY,
                                    description: 'List of coverages for this item.',
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            type: { type: Type.STRING, description: 'The name of the coverage in Greek' },
                                            limit: { type: Type.STRING, description: "The coverage limit from the 'ΑΣΦ. ΚΕΦ. (€)' column, formatted as a string." },
                                            deductible: { type: Type.STRING, description: "The deductible from the 'ΑΠΑΛΛ.' column. Omit if not present." },
                                        },
                                        required: ['type', 'limit'],
                                    },
                                },
                            },
                            required: ['id', 'description', 'coverages'],
                        },
                    },
                },
                required: ['policyNumber', 'insurer', 'policyholder', 'insuredItems'],
            };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                }
            });

            const policyData = JSON.parse(response.text) as DetailedPolicy;
            setParsedPolicy(policyData);

        } catch (err) {
            console.error("Error extracting policy data with Gemini:", err);
            setError("Failed to extract policy data using AI. Please check the document or try again.");
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    };

    const handleAnalyzeGaps = async () => {
        if (!parsedPolicy || !userNeeds) return;
        
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            setError("Gemini API Key is not configured. Please set it in the Settings page.");
            return;
        }
        
        setIsLoading(true);
        setLoadingStep(t('gapAnalysis.analyzing') as string);
        setAnalysisResult(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey });
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
            markTaskCompleted('policyAnalyzed');

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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('gapAnalysis.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('gapAnalysis.description')}</p>

            {!file ? (
                <FileUploader onFileUpload={handleFileUpload} error={error} />
            ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button 
                            onClick={resetState}
                            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                            Change File
                        </button>
                    </div>
                </div>
            )}
            
            {error && !parsedPolicy && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

            <PolicyParser parsedPolicy={parsedPolicy} isLoading={isLoading && loadingStep === t('gapAnalysis.fetchingPolicy')} />

            {parsedPolicy && !analysisResult && (
                <PolicyReviewForm 
                    userNeeds={userNeeds}
                    setUserNeeds={setUserNeeds}
                    onSubmit={handleAnalyzeGaps}
                    isLoading={isLoading && loadingStep === t('gapAnalysis.analyzing')}
                />
            )}
            
            {isLoading && loadingStep === t('gapAnalysis.analyzing') && (
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>{loadingStep}</p>
                </div>
            )}
            
            {analysisResult && (
                 <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">{t('gapAnalysis.resultsTitle')}</h2>
                    {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
                    <GapAnalysisResults result={analysisResult} />
                    <div className="text-center mt-6">
                        <button 
                            onClick={() => alert('This would add the extracted policy information to a new or existing customer in the CRM.')}
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-md"
                        >
                            {t('gapAnalysis.addToCrm')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GapAnalysis;
