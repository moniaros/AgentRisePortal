
import React from 'react';
import { DetailedPolicy } from '../../types';
import PolicyParser from './PolicyParser';

interface AcordPolicyDisplayProps {
  acordData: any; // Raw ACORD data
}

// This component would take raw ACORD data, map it using the mapper,
// and then display it. For this mock, we just use a placeholder component.
const AcordPolicyDisplay: React.FC<AcordPolicyDisplayProps> = ({ acordData }) => {
  // In a real implementation, you might do:
  // const detailedPolicy = mapAcordToDetailedPolicy(acordData);
  
  const mockPolicy: DetailedPolicy = {
    policyNumber: 'ACORD-MOCK-123',
    insurer: 'Mock Insurer',
    policyholder: { name: 'From ACORD Data', address: '123 ACORD Lane' },
    insuredItems: [{ id: '1', description: 'Mock Item', coverages: [{type: 'Mock Coverage', limit: '$100,000'}] }]
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">ACORD Policy Details (Mock)</h2>
      <PolicyParser parsedPolicy={mockPolicy} isLoading={false} />
    </div>
  );
};

export default AcordPolicyDisplay;
