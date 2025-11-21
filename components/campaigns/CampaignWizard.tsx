
import React, { useState, useEffect } from 'react';
// FIX: Correct import path
import { Campaign, CampaignObjective, Language } from '../../types';
import Step1Objective from './steps/Step1_Objective';
import Step2Audience from './steps/Step2_Audience';
import Step3Budget from './steps/Step3_Budget';
import Step4Creative from './steps/Step4_Creative';
import Step5LeadCapture from './steps/Step5_LeadCapture';
import Step6Review from './steps/Step5_Review';
import { useLocalization } from '../../hooks/useLocalization';

const initialCampaignData: Omit<Campaign, 'id' | 'agencyId'> = {
    name: '',
    objective: CampaignObjective.LEAD_GENERATION,
    network: 'facebook',
    language: Language.EN,
    audience: {
        ageRange: [18, 65],
        interests: [],
    },
    budget: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    creative: {
        headline: '',
        body: '',
        image: '',
    },
    status: 'draft',
    leadCaptureForm: {
      fields: [{name: 'email', type: 'email', required: true}, {name: 'phone', type: 'tel', required: true}]
    },
};

interface CampaignWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaign: Omit<Campaign, 'id' | 'agencyId'>) => void;
}

const CampaignWizard: React.FC<CampaignWizardProps> = ({ isOpen, onClose, onSave }) => {
    const { t, language } = useLocalization();
    const [currentStep, setCurrentStep] = useState(0);
    const [campaignData, setCampaignData] = useState<Omit<Campaign, 'id' | 'agencyId'>>(initialCampaignData);
    
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setCampaignData(initialCampaignData);
        }
    }, [isOpen]);

    const handleNext = () => setCurrentStep(prev => prev + 1);
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleSave = () => {
        onSave(campaignData);
        onClose();
    };

    const applyTemplate = (type: 'homeEnfia' | 'health' | 'auto') => {
        const templates = {
            homeEnfia: {
                name: 'ENFIA Tax Reduction Promo',
                objective: CampaignObjective.LEAD_GENERATION,
                network: 'facebook',
                language: Language.EL,
                audience: { ageRange: [35, 65], interests: ['Real Estate', 'Home Improvement', 'Tax Planning'] },
                creative: {
                    headline: 'Μειώστε τον ΕΝΦΙΑ κατά 10%',
                    body: 'Ασφαλίστε την κατοικία σας σήμερα και κερδίστε άμεση φοροαπαλλαγή. Προστασία από φωτιά και σεισμό.',
                    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop'
                }
            },
            health: {
                name: 'Private Health Access',
                objective: CampaignObjective.LEAD_GENERATION,
                network: 'instagram',
                language: Language.EL,
                audience: { ageRange: [30, 55], interests: ['Health & Wellness', 'Parenting', 'Family'] },
                creative: {
                    headline: 'Υγεία χωρίς αναμονές',
                    body: 'Εξασφαλίστε την οικογένειά σας με πρόσβαση στα κορυφαία ιδιωτικά νοσοκομεία. Οικονομικά προγράμματα για όλους.',
                    image: 'https://images.unsplash.com/photo-1505751172569-e001ade5dfe0?q=80&w=1000&auto=format&fit=crop'
                }
            },
            auto: {
                name: 'Auto Insurance Value',
                objective: CampaignObjective.LEAD_GENERATION,
                network: 'facebook',
                language: Language.EL,
                audience: { ageRange: [25, 50], interests: ['Cars', 'Driving', 'Commuting'] },
                creative: {
                    headline: 'Οδική Βοήθεια & Θραύση Κρυστάλλων',
                    body: 'Μην πληρώνετε ακριβά. Πλήρης ασφάλεια αυτοκινήτου με όλες τις καλύψεις που χρειάζεστε.',
                    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1000&auto=format&fit=crop'
                }
            }
        };

        // @ts-ignore
        setCampaignData({ ...initialCampaignData, ...templates[type] });
        setCurrentStep(1); // Skip to customization
    };

    if (!isOpen) return null;

    const steps = [
        t('campaigns.wizard.chooseTemplate'), 'Objective', 'Audience', 'Budget', 'Creative', 'Lead Form', 'Review'
    ];

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Select a High-Converting Template</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => applyTemplate('homeEnfia')} className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition group">
                                <div className="text-2xl mb-2">🏡</div>
                                <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-blue-600">ENFIA Tax Break</h4>
                                <p className="text-sm text-gray-500 mt-1">Target homeowners looking for tax reductions.</p>
                            </button>
                            <button onClick={() => applyTemplate('health')} className="p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50 text-left transition group">
                                <div className="text-2xl mb-2">🏥</div>
                                <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-purple-600">Private Health</h4>
                                <p className="text-sm text-gray-500 mt-1">Target families wanting to avoid public hospital queues.</p>
                            </button>
                            <button onClick={() => applyTemplate('auto')} className="p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 text-left transition group">
                                <div className="text-2xl mb-2">🚗</div>
                                <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-green-600">Auto Value</h4>
                                <p className="text-sm text-gray-500 mt-1">Competitive rates with roadside assistance.</p>
                            </button>
                        </div>
                        <div className="mt-6 border-t pt-4">
                            <button onClick={() => setCurrentStep(1)} className="text-sm text-gray-500 underline">Skip and create from scratch</button>
                        </div>
                    </div>
                );
            case 1: return <Step1Objective data={campaignData} setData={setCampaignData} />;
            case 2: return <Step2Audience data={campaignData} setData={setCampaignData} />;
            case 3: return <Step3Budget data={campaignData} setData={setCampaignData} />;
            case 4: return <Step4Creative data={campaignData} setData={setCampaignData} />;
            case 5: return <Step5LeadCapture data={campaignData} setData={setCampaignData} />;
            case 6: return <Step6Review data={campaignData} />;
            default: return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">
                        {currentStep === 0 ? 'Start Campaign' : `Step ${currentStep}: ${steps[currentStep]}`}
                    </h2>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {renderStep()}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-between items-center border-t dark:border-gray-700">
                    <div>
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                            Close
                        </button>
                    </div>
                    {currentStep > 0 && (
                        <div className="flex items-center gap-2">
                            <button 
                                type="button" 
                                onClick={handleBack} 
                                disabled={currentStep === 0}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-500 rounded-md disabled:opacity-50"
                            >
                                Back
                            </button>
                            {currentStep < steps.length - 1 ? (
                                <button 
                                    type="button" 
                                    onClick={handleNext} 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Next
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Launch Campaign
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignWizard;
