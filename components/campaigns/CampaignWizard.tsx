import React, { useState, useEffect } from 'react';
// FIX: Correct import path
import { Campaign, CampaignObjective, Language } from '../../types';
import Step1Objective from './steps/Step1_Objective';
import Step2Audience from './steps/Step2_Audience';
import Step3Budget from './steps/Step3_Budget';
import Step4Creative from './steps/Step4_Creative';
import Step5LeadCapture from './steps/Step5_LeadCapture';
import Step6Review from './steps/Step5_Review';

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
      fields: [{name: 'email', type: 'email', required: true}]
    },
};

interface CampaignWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaign: Omit<Campaign, 'id' | 'agencyId'>) => void;
}

const steps = [
  'Objective', 'Audience', 'Budget', 'Creative', 'Lead Form', 'Review'
];

const CampaignWizard: React.FC<CampaignWizardProps> = ({ isOpen, onClose, onSave }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [campaignData, setCampaignData] = useState<Omit<Campaign, 'id' | 'agencyId'>>(initialCampaignData);
    
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setCampaignData(initialCampaignData);
        }
    }, [isOpen]);

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleSave = () => {
        onSave(campaignData);
        onClose();
    };

    if (!isOpen) return null;

    const renderStep = () => {
        switch (currentStep) {
            // FIX: The `setData` prop expects a state setter for `Omit<Campaign, 'id' | 'agencyId'>` to match the `campaignData` state type. The step components were updated to reflect this.
            case 0: return <Step1Objective data={campaignData} setData={setCampaignData} />;
            case 1: return <Step2Audience data={campaignData} setData={setCampaignData} />;
            case 2: return <Step3Budget data={campaignData} setData={setCampaignData} />;
            case 3: return <Step4Creative data={campaignData} setData={setCampaignData} />;
            case 4: return <Step5LeadCapture data={campaignData} setData={setCampaignData} />;
            case 5: return <Step6Review data={campaignData} />;
            default: return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">Create New Campaign - Step {currentStep + 1}: {steps[currentStep]}</h2>
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
                                Save Campaign
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignWizard;