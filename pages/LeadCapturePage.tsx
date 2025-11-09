import React from 'react';
import { useParams } from 'react-router-dom';

// In a real app, you'd fetch this data based on campaignId
const MOCK_CAMPAIGN = {
    id: 'camp_1',
    name: 'Summer Auto Insurance Promo',
    creative: {
        headline: 'Save Big on Car Insurance This Summer!',
        body: 'Get a free quote today and see how much you can save.',
        image: 'https://via.placeholder.com/1200x628.png?text=Summer+Car+Insurance'
    },
    leadCaptureForm: {
        fields: [
            { name: 'email', type: 'email', required: true },
            { name: 'name', type: 'text', required: true },
            { name: 'phone', type: 'tel', required: false },
        ]
    }
};


const LeadCapturePage: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    // Here you would fetch campaign data using campaignId
    const campaign = MOCK_CAMPAIGN; 
    const [submitted, setSubmitted] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would send the form data to your backend
        console.log('Form submitted for campaign:', campaignId);
        setSubmitted(true);
    };

    if (submitted) {
        return (
             <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
                    <h1 className="text-2xl font-bold text-green-600 mb-4">Thank You!</h1>
                    <p className="text-gray-600">Your information has been submitted. An agent will contact you shortly.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden">
                {campaign.creative.image && <img src={campaign.creative.image} alt={campaign.name} className="w-full h-48 object-cover" />}
                <div className="p-8">
                    <h1 className="text-2xl font-bold mb-2">{campaign.creative.headline}</h1>
                    <p className="text-gray-600 mb-6">{campaign.creative.body}</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {campaign.leadCaptureForm.fields.map(field => (
                            <div key={field.name}>
                                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 capitalize">
                                    {field.name}
                                    {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type={field.type}
                                    id={field.name}
                                    name={field.name}
                                    required={field.required}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        ))}
                         <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Get My Free Quote
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LeadCapturePage;
