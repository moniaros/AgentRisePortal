

import React from 'react';
import { Campaign } from '../../../types';

interface StepProps {
    // FIX: Aligned the data type with the parent wizard's state to resolve type mismatch.
    data: Omit<Campaign, 'id' | 'agencyId'>;
    setData: React.Dispatch<React.SetStateAction<Omit<Campaign, 'id' | 'agencyId'>>>;
}

const Step3Budget: React.FC<StepProps> = ({ data, setData }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget (€)</label>
                <input
                    type="number"
                    value={data.budget}
                    onChange={e => setData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                    <input
                        type="date"
                        value={data.startDate}
                        onChange={e => setData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                    <input
                        type="date"
                        value={data.endDate}
                        onChange={e => setData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
            </div>
        </div>
    );
};
export default Step3Budget;