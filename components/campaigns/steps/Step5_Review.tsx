
import React from 'react';
import { Campaign } from '../../../types';

interface StepProps {
    data: Omit<Campaign, 'id'>;
}

const Step5Review: React.FC<StepProps> = ({ data }) => {
    return (
        <div className="space-y-3 text-sm">
            <h3 className="text-lg font-semibold">Review Your Campaign</h3>
            <p><strong className="font-medium text-gray-600 dark:text-gray-400">Name:</strong> {data.name || 'Not set'}</p>
            <p><strong className="font-medium text-gray-600 dark:text-gray-400">Objective:</strong> {data.objective.replace(/_/g, ' ') || 'Not set'}</p>
            <p><strong className="font-medium text-gray-600 dark:text-gray-400">Budget:</strong> €{data.budget.toLocaleString() || 'Not set'}</p>
            <p><strong className="font-medium text-gray-600 dark:text-gray-400">Schedule:</strong> {data.startDate || 'N/A'} to {data.endDate || 'N/A'}</p>
            <p><strong className="font-medium text-gray-600 dark:text-gray-400">Audience:</strong> Ages {data.audience.ageRange[0]}-{data.audience.ageRange[1]}, interested in "{data.audience.interests.join(', ')||"N/A"}"</p>
            <p><strong className="font-medium text-gray-600 dark:text-gray-400">Headline:</strong> {data.creative.headline || 'Not set'}</p>
             <p><strong className="font-medium text-gray-600 dark:text-gray-400">Body:</strong> {data.creative.body || 'Not set'}</p>
        </div>
    );
};
export default Step5Review;
