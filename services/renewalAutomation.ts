import { Customer, Policy, User, AutomatedTask, ReminderLogEntry } from '../types';

/**
 * Configuration for renewal reminder intervals in days.
 */
const RENEWAL_INTERVALS = [90, 60, 30, 15, 7];

/**
 * Calculates the difference in days between two dates, ignoring the time component.
 * @param date1 - The first date.
 * @param date2 - The second date.
 * @returns The number of full days between date1 and date2.
 */
const dayDifference = (date1: Date, date2: Date): number => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((utc2 - utc1) / msPerDay);
};

/**
 * Simulates a daily check for policies that require renewal reminders.
 * @param customers - An array of all customer data.
 * @param users - An array of all user data.
 * @param reminderLog - The current log of sent reminders to prevent duplicates.
 * @param translations - The translation object for creating reminder messages.
 * @returns An array of newly generated AutomatedTask objects.
 */
export const runRenewalChecks = (
    customers: Customer[],
    users: User[],
    reminderLog: ReminderLogEntry[],
    translations: any
): { newTasks: AutomatedTask[], updatedLog: ReminderLogEntry[] } => {
    
    const newTasks: AutomatedTask[] = [];
    const today = new Date();
    const userMap = new Map(users.map(u => [u.id, u]));

    customers.forEach(customer => {
        customer.policies.forEach(policy => {
            if (!policy.isActive) return;

            const expiryDate = new Date(policy.endDate);
            const daysUntilExpiration = dayDifference(today, expiryDate);

            // Check if the policy is expiring at one of the predefined intervals
            if (RENEWAL_INTERVALS.includes(daysUntilExpiration)) {
                // Create a unique key to log this specific reminder (e.g., "pol123_30_days")
                const logKey = `${policy.id}_${daysUntilExpiration}_days`;

                // Check if this reminder has already been logged/sent
                const alreadySent = reminderLog.some(entry => entry.logKey === logKey);

                if (!alreadySent) {
                    const agent = userMap.get(customer.assignedAgentId);
                    const agentName = agent ? `${agent.party.partyName.firstName} ${agent.party.partyName.lastName}` : 'Unassigned';
                    
                    // Use the bilingual template to create the reminder message
                    const message = (translations.reminders?.renewalTemplate || '')
                        .replace('{policyType}', translations.policyTypes?.[policy.type] || policy.type)
                        .replace('{policyNumber}', policy.policyNumber)
                        .replace('{policyholderName}', `${customer.firstName} ${customer.lastName}`)
                        .replace('{expiryDate}', expiryDate.toLocaleDateString(translations.language))
                        .replace('{agentAssigned}', agentName);

                    const newTask: AutomatedTask = {
                        id: `task_${policy.id}_${daysUntilExpiration}`,
                        type: 'RENEWAL_REMINDER',
                        policyId: policy.id,
                        customerId: customer.id,
                        agentId: customer.assignedAgentId,
                        message,
                        createdAt: today.toISOString(),
                    };

                    newTasks.push(newTask);
                    
                    // Add an entry to the log to prevent this reminder from being sent again
                    reminderLog.push({
                        logKey,
                        policyId: policy.id,
                        reminderInterval: daysUntilExpiration,
                        sentAt: today.toISOString(),
                    });
                }
            }
        });
    });

    return { newTasks, updatedLog: reminderLog };
};
