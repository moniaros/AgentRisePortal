import { useState, useCallback } from 'react';
import { useCrmData } from './useCrmData';
import * as policyStorage from '../services/policyStorage';
import { mapAcordToCrmPolicy } from '../services/acordMapper';
import { Customer } from '../types';

export const usePolicySync = () => {
    const { customers, updateCustomer, addCustomer } = useCrmData();
    const [isSyncing, setIsSyncing] = useState(false);

    const syncPolicies = useCallback(async () => {
        setIsSyncing(true);
        const storedData = policyStorage.getStoredData();
        let syncedCustomers = 0;
        let syncedPolicies = 0;

        // Simulate an async operation for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        const customersToUpdate: Customer[] = [];
        const customersToAdd: Omit<Customer, 'id' | 'timeline' | 'agencyId'>[] = [];

        for (const customerId in storedData) {
            const storedCustomerRecord = storedData[customerId];
            if (storedCustomerRecord.policies.length === 0) continue;

            const policyholderName = storedCustomerRecord.policies[0].policyholder.name;
            const [firstName, ...lastNameParts] = policyholderName.split(' ');
            const lastName = lastNameParts.join(' ');
            
            let existingCustomer = customers.find(c => 
                c.firstName.toLowerCase() === firstName.toLowerCase() && 
                c.lastName.toLowerCase() === lastName.toLowerCase()
            );

            if (existingCustomer) {
                // --- Customer exists, prepare to update ---
                const updatedCustomer = { ...existingCustomer, policies: [...existingCustomer.policies] };
                let policiesChanged = false;

                storedCustomerRecord.policies.forEach(acordPolicy => {
                    const newCrmPolicy = mapAcordToCrmPolicy(acordPolicy);
                    const policyIndex = updatedCustomer.policies.findIndex(p => p.policyNumber === newCrmPolicy.policyNumber);

                    if (policyIndex > -1) {
                        // Update existing policy
                        updatedCustomer.policies[policyIndex] = newCrmPolicy;
                    } else {
                        // Add new policy
                        updatedCustomer.policies.push(newCrmPolicy);
                    }
                    policiesChanged = true;
                    syncedPolicies++;
                });
                
                if (policiesChanged) {
                    customersToUpdate.push(updatedCustomer);
                }

            } else {
                // --- Customer does not exist, prepare to create ---
                const newCrmPolicies = storedCustomerRecord.policies.map(mapAcordToCrmPolicy);
                const newCustomerData: Omit<Customer, 'id' | 'timeline' | 'agencyId'> = {
                    firstName,
                    lastName,
                    email: '', // Not in our mock ACORD data
                    address: storedCustomerRecord.policies[0].policyholder.address,
                    policies: newCrmPolicies,
                    communicationPreferences: ['email'],
                };
                customersToAdd.push(newCustomerData);
                syncedCustomers++;
                syncedPolicies += newCrmPolicies.length;
            }
        }
        
        // Batch update state
        customersToUpdate.forEach(c => updateCustomer(c));
        customersToAdd.forEach(c => addCustomer(c));

        setIsSyncing(false);
        return { syncedCustomers, syncedPolicies };
    }, [customers, updateCustomer, addCustomer]);

    return { isSyncing, syncPolicies };
};