


import React from 'react';
import { Campaign, CampaignObjective } from '../../../types';

interface StepProps {
    // FIX: Aligned the data type with the parent wizard's state to resolve type mismatch.
    data: Omit<Campaign, 'id' | 'agencyId'>;
    setData: React.Dispatch<React.SetStateAction<Omit<Campaign, 'id' | 'agencyId'>>>;
}

const Step1Objective: React.FC<StepProps> = ({ data, setData }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Campaign Name</label>
                <input
                    type="text"
                    value={data.name}
                    onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Objective</label>
                <select
                    value={data.objective}
                    onChange={e => setData(prev => ({ ...prev, objective: e.target.value as CampaignObjective }))}
                    className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                >
                    {Object.values(CampaignObjective).map(obj => (
                        <option key={obj as string} value={obj as string}>{(obj as string).replace(/_/g, ' ')}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};
export default Step1Objective;
