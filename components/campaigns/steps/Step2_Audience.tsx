

import React from 'react';
import { Campaign } from '../../../types';

interface StepProps {
    // FIX: Aligned the data type with the parent wizard's state to resolve type mismatch.
    data: Omit<Campaign, 'id' | 'agencyId'>;
    setData: React.Dispatch<React.SetStateAction<Omit<Campaign, 'id' | 'agencyId'>>>;
}

const Step2Audience: React.FC<StepProps> = ({ data, setData }) => {
    const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const interests = e.target.value.split(',').map(i => i.trim());
        setData(prev => ({...prev, audience: {...prev.audience, interests}}));
    }
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age Range: {data.audience.ageRange[0]} - {data.audience.ageRange[1]}</label>
                {/* A proper range slider would be better here */}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interests (comma-separated)</label>
                <input
                    type="text"
                    value={data.audience.interests.join(', ')}
                    onChange={handleInterestsChange}
                    className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    placeholder="e.g., cars, real estate, finance"
                />
            </div>
        </div>
    );
};
export default Step2Audience;