
import React, { useState } from 'react';
import { Campaign, CampaignObjective } from '../../types';
import Step1Objective from './steps/Step1_Objective';
import Step2Audience from './steps/Step2_Audience';
import Step3Budget from './steps/Step3_Budget';
import Step4Creative from './steps/Step4_Creative';
import Step5Review from './steps/Step5_Review';

interface CampaignWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaign: Omit<Campaign, 'id'>) => void;
}

const emptyCampaign: Omit<Campaign, 'id'> = {
    name: '',
    objective: CampaignObjective.LEAD_GENERATION,
    status: 'draft',
    budget: 1000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    audience: { ageRange: [18, 65], interests: [] },
    creative: { headline: '', body: '', image: '' }
};

const CampaignWizard: React.FC<CampaignWizardProps> = ({ isOpen, onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [campaignData, setCampaignData] = useState(emptyCampaign);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);
    const handleSave = () => {
        onSave(campaignData);
        onClose();
        setStep(1);
        setCampaignData(emptyCampaign);
    };

    if (!isOpen) return null;

    const steps = [
        <Step1Objective data={campaignData} setData={setCampaignData} />,
        <Step2Audience data={campaignData} setData={setCampaignData} />,
        <Step3Budget data={campaignData} setData={setCampaignData} />,
        <Step4Creative data={campaignData} setData={setCampaignData} />,
        <Step5Review data={campaignData} />,
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">Create Campaign (Step {step}/5)</h2>
                </div>
                <div className="p-6 min-h-[300px]">
                    {steps[step - 1]}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-between items-center border-t dark:border-gray-700">
                    <button onClick={handleBack} disabled={step === 1} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded disabled:opacity-50">Back</button>
                    {step < 5 && <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>}
                    {step === 5 && <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save Campaign</button>}
                </div>
            </div>
        </div>
    );
};

export default CampaignWizard;
