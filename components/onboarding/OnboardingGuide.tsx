import React from 'react';

interface OnboardingStep {
  title: string;
  description: string;
}

const OnboardingGuide: React.FC = () => {
  const steps: OnboardingStep[] = [
    { title: "Complete Your Profile", description: "Fill out your agent details to get started." },
    { title: "Connect Social Accounts", description: "Automatically pull leads from your social media." },
    { title: "Set Up Billing", description: "Connect your payment provider to manage policies." },
  ];

  const [currentStep, setCurrentStep] = React.useState(0);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Onboarding Guide</h3>
      <div className="flex items-center space-x-4 mb-6">
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {index + 1}
            </div>
            {index < steps.length - 1 && <div className={`flex-1 h-1 ${index < currentStep ? 'bg-blue-500' : 'bg-gray-200'}`}></div>}
          </React.Fragment>
        ))}
      </div>
      <div>
        <h4 className="font-bold">{steps[currentStep].title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{steps[currentStep].description}</p>
      </div>
       <div className="mt-6 flex justify-between">
        <button 
          onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button 
          onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
          disabled={currentStep === steps.length - 1}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OnboardingGuide;
