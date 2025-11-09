import React from 'react';
import { Campaign } from '../../../types';
import AdPreview from '../AdPreview';

interface StepProps {
    data: Omit<Campaign, 'id'>;
}

const Step6Review: React.FC<StepProps> = ({ data }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Review Your Campaign</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Details Column */}
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold">Objective</h4>
                        <p>{data.name}</p>
                        <p className="text-sm text-gray-500">{(data.objective as string).replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Audience</h4>
                        <p>Age: {data.audience.ageRange[0]} - {data.audience.ageRange[1]}</p>
                        <p>Interests: {data.audience.interests.join(', ')}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Budget & Schedule</h4>
                        <p>Budget: €{data.budget.toFixed(2)}</p>
                        <p>Duration: {data.startDate} to {data.endDate}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold">Lead Form Fields</h4>
                        <ul className="list-disc list-inside text-sm text-gray-500">
                           {data.leadCaptureForm?.fields.map(f => <li key={f.name}>{f.name} ({f.type}) {f.required ? '(Required)' : ''}</li>)}
                        </ul>
                    </div>
                </div>

                {/* Ad Preview Column */}
                <div>
                    <h4 className="font-semibold mb-2">Ad Creative Preview</h4>
                    <AdPreview creative={data.creative} />
                </div>
            </div>
        </div>
    );
};
export default Step6Review;
