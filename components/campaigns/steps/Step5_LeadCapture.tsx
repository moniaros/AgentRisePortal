

import React from 'react';
import { Campaign, LeadCaptureFormField } from '../../../types';

interface StepProps {
    // FIX: Aligned the data type with the parent wizard's state to resolve type mismatch.
    data: Omit<Campaign, 'id' | 'agencyId'>;
    setData: React.Dispatch<React.SetStateAction<Omit<Campaign, 'id' | 'agencyId'>>>;
}

const Step5LeadCapture: React.FC<StepProps> = ({ data, setData }) => {
    
    const fields = data.leadCaptureForm?.fields || [];

    const handleAddField = () => {
        const newField: LeadCaptureFormField = { name: '', type: 'text', required: false };
        setData(prev => ({
            ...prev,
            leadCaptureForm: {
                fields: [...fields, newField]
            }
        }));
    };
    
    const handleFieldChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        const newFields = [...fields];
        if (type === 'checkbox') {
             (newFields[index] as any)[name] = checked;
        } else {
            (newFields[index] as any)[name] = value;
        }

        setData(prev => ({
            ...prev,
            leadCaptureForm: { fields: newFields }
        }));
    };
    
    const handleRemoveField = (index: number) => {
        const newFields = fields.filter((_, i) => i !== index);
        setData(prev => ({
            ...prev,
            leadCaptureForm: { fields: newFields }
        }));
    };
    
    return (
        <div>
            <h3 className="font-semibold mb-4">Configure Lead Capture Form</h3>
            <p className="text-sm text-gray-500 mb-4">This form will be shown to users who click your ad. Email is required.</p>
            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded dark:border-gray-600">
                        <input 
                            type="text"
                            name="name"
                            value={field.name}
                            onChange={(e) => handleFieldChange(index, e)}
                            placeholder="Field Name (e.g., phone)"
                            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 flex-grow"
                            disabled={field.name === 'email'}
                        />
                        <select
                            name="type"
                            value={field.type}
                            onChange={(e) => handleFieldChange(index, e)}
                            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            disabled={field.name === 'email'}
                        >
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="tel">Phone</option>
                            <option value="number">Number</option>
                        </select>
                         <label className="flex items-center gap-2">
                             <input type="checkbox" name="required" checked={field.required} onChange={(e) => handleFieldChange(index, e)} disabled={field.name === 'email'} />
                             Required
                         </label>
                        <button onClick={() => handleRemoveField(index)} disabled={field.name === 'email'} className="text-red-500 disabled:opacity-50">&times;</button>
                    </div>
                ))}
            </div>
            <button onClick={handleAddField} className="mt-4 text-sm text-blue-600">+ Add Field</button>
        </div>
    );
};
export default Step5LeadCapture;