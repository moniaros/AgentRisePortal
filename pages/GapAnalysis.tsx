import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Policy } from '../../types';
import FileUploader from '../components/gap-analysis/FileUploader';
import PolicyParser from '../components/gap-analysis/PolicyParser';
import PolicyReviewForm from '../components/gap-analysis/PolicyReviewForm';
import { GoogleGenAI, Type } from '@google/genai';

const GapAnalysis: React.FC = () => {
    const { t } = useLocalization();
    const [file, setFile] = useState<File | null>(null);
    const [parsedPolicy, setParsedPolicy] = useState<Partial<Policy> | null>(null);
    const [userNeeds, setUserNeeds] = useState('');
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleFileUpload = async (uploadedFile: File) => {
        if (!process.env.API_KEY) {
            setError("API key is not configured.");
            return;
        }
        setFile(uploadedFile);
        setParsedPolicy(null);
        setAnalysisResult(null);
        setError(null);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = await fileToGenerativePart(uploadedFile);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { parts: [imagePart, { text: "Extract key information from this insurance policy document." }] }
                ],
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            policyNumber: { type: Type.STRING },
                            insurer: { type: Type.STRING },
                            premium: { type: Type.NUMBER },
                            startDate: { type: Type.STRING },
                            endDate: { type: Type.STRING },
                        }
                    }
                }
            });
            
            const jsonStr = response.text;
            const parsed = JSON.parse(jsonStr);
            setParsedPolicy(parsed);

        } catch (err) {
            console.error("Error parsing policy:", err);
            setError("Failed to parse the policy document. Please try a clearer image or a different file.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeGaps = async () => {
        if (!parsedPolicy || !userNeeds || !process.env.API_KEY) return;
        
        setIsLoading(true);
        setAnalysisResult(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Perform a gap analysis.
            Current Policy Details: ${JSON.stringify(parsedPolicy)}
            Customer Needs: "${userNeeds}"
            
            Based on the customer's needs, identify any gaps in their current policy coverage. Suggest specific types of coverage or policy adjustments they should consider. Format your response as markdown.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro', // Using Pro for more complex reasoning
                contents: prompt
            });
            setAnalysisResult(response.text);

        } catch (err) {
            console.error("Error analyzing gaps:", err);
            setError("Failed to perform gap analysis. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('nav.gapAnalysis')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('gapAnalysis.description')}</p>

            {!file && <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading} />}
            
            {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

            {file && <p className="mt-4">Uploaded: <strong>{file.name}</strong></p>}
            
            <PolicyParser parsedPolicy={parsedPolicy} isLoading={isLoading && !parsedPolicy} />

            {parsedPolicy && (
                <PolicyReviewForm 
                    userNeeds={userNeeds}
                    setUserNeeds={setUserNeeds}
                    onSubmit={handleAnalyzeGaps}
                    isLoading={isLoading && !!userNeeds}
                />
            )}
            
            {analysisResult && (
                 <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">{t('gapAnalysis.resultsTitle')}</h3>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }} />
                </div>
            )}
        </div>
    );
};

export default GapAnalysis;