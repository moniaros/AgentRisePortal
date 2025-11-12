import { useState, useCallback } from 'react';
import { useCrmData } from './useCrmData';
import { mapAcordToCrmPolicy, mapToPolicyACORD } from '../services/acordMapper';
import { DetailedPolicy, Customer } from '../types';

export const usePolicyCrmSync = () => {
    const { customers, updateCustomer, addCustomer } = useCrmData();
    const [isSyncing, setIsSyncing] = useState(false);

    const syncPolicyDataToCrm = useCallback(async (policyData: DetailedPolicy): Promise<boolean> => {
        setIsSyncing(true);
        
        // Simulate async operation for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const { name, address } = policyData.policyholder;
            const [firstName, ...lastNameParts] = name.split(' ');
            const lastName = lastNameParts.join(' ');

            // Find existing customer by name (simple matching)
            const existingCustomer = customers.find(c => 
                c.firstName.toLowerCase() === firstName.toLowerCase() &&
                c.lastName.toLowerCase() === lastName.toLowerCase()
            );
            
            // Map the detailed policy to CRM format
            const acordPolicy = mapToPolicyACORD(policyData);
            const crmPolicy = mapAcordToCrmPolicy(acordPolicy);

            if (existingCustomer) {
                // --- Update existing customer ---
                const policyIndex = existingCustomer.policies.findIndex(p => p.policyNumber === crmPolicy.policyNumber);
                let updatedPolicies = [...existingCustomer.policies];
                
                if (policyIndex > -1) {
                    updatedPolicies[policyIndex] = crmPolicy; // Update policy
                } else {
                    updatedPolicies.push(crmPolicy); // Add new policy
                }
                
                updateCustomer({ ...existingCustomer, policies: updatedPolicies });
            } else {
                // --- Create new customer ---
                const newCustomer: Omit<Customer, 'id' | 'timeline' | 'agencyId'> = {
                    firstName,
                    lastName,
                    email: '', // Not available from our current AI extraction
                    address,
                    policies: [crmPolicy],
                };
                addCustomer(newCustomer);
            }
            setIsSyncing(false);
            return true;
        } catch (error) {
            console.error("Error syncing policy data to CRM:", error);
            setIsSyncing(false);
            return false;
        }
    }, [customers, addCustomer, updateCustomer]);

    return { isSyncing, syncPolicyDataToCrm };
};