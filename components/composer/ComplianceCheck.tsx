import React, { useState } from 'react';
import { generateGeminiContent } from '../../services/geminiClient';
import { useLocalization } from '../../hooks/useLocalization';
import { Language } from '../../types';

interface ComplianceCheckProps {
    content: string;
}

const ComplianceCheck: React.FC<ComplianceCheckProps> = ({ content }) => {
    const { language } = useLocalization();
    const [status, setStatus] = useState<'idle' | 'scanning' | 'safe' | 'warning'>('idle');
    const [issues, setIssues] = useState<string[]>([]);

    const handleScan = async () => {
        if (!content) return;
        setStatus('scanning');
        setIssues([]);

        try {
            const targetLang = language === Language.EL ? 'Greek' : 'English';
            
            const prompt = `
                Act as a strict Insurance Compliance Officer. Analyze the following social media post text for compliance risks.
                The text is in ${targetLang}.
                
                Flag the following rigorously:
                1. Absolute guarantees (e.g., "cheapest", "best", "100%", "always").
                2. Greek specific triggers: "Εγγυημένα", "Σίγουρα", "Φθηνότερα", "Καλύτερη τιμή", "Χωρίς ρίσκο".
                3. Promising coverage without conditions.
                4. Fear-mongering tactics.
                5. Unlicensed financial advice.

                If issues are found, list them briefly in ${targetLang}. If safe, return "SAFE".

                Text: "${content}"
            `;

            const rawText = await generateGeminiContent({
                contents: prompt,
            });

            const text = rawText.trim();
            
            if (text.includes("SAFE") && text.length < 10) {
                setStatus('safe');
            } else {
                setStatus('warning');
                // Split by newlines or bullet points to get list
                const issueList = text.split('\n').filter(line => line.trim().length > 0);
                setIssues(issueList);
            }

        } catch (error) {
            console.error("Compliance scan error", error);
            setStatus('idle');
        }
    };

    if (!content) return null;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    🛡️ {language === Language.EL ? 'Έλεγχος Συμμόρφωσης' : 'Compliance Check'}
                </h3>
                {status === 'idle' && (
                    <button 
                        onClick={handleScan}
                        className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-full border dark:border-gray-600"
                    >
                        {language === Language.EL ? 'Σάρωση' : 'Scan Text'}
                    </button>
                )}
            </div>

            {status === 'scanning' && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                    {language === Language.EL ? 'Γίνεται έλεγχος κανονισμών...' : 'Reviewing regulations...'}
                </div>
            )}

            {status === 'safe' && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-center gap-2 text-green-800 dark:text-green-200 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>{language === Language.EL ? 'Το περιεχόμενο φαίνεται ασφαλές.' : 'Content appears compliant.'}</span>
                </div>
            )}

            {status === 'warning' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm font-bold mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <span>{language === Language.EL ? 'Εντοπίστηκαν Κίνδυνοι' : 'Compliance Risks Detected'}</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        {issues.map((issue, idx) => (
                            <li key={idx}>{issue.replace(/^- /, '')}</li>
                        ))}
                    </ul>
                    <button onClick={handleScan} className="mt-3 text-xs text-amber-600 underline hover:text-amber-800">
                        {language === Language.EL ? 'Επανάληψη Σάρωσης' : 'Re-scan'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ComplianceCheck;
