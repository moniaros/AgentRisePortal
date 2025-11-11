import { Language } from "../types";

export const TEMPLATE_PLACEHOLDERS = [
    { label: 'Lead First Name', value: '{{Lead.FirstName}}' },
    { label: 'Lead Last Name', value: '{{Lead.LastName}}' },
    { label: 'Lead Email', value: '{{Lead.Email}}' },
    { label: 'Lead Score', value: '{{Lead.Score}}' },
    { label: 'Agent First Name', value: '{{Agent.FirstName}}' },
    { label: 'Agent Last Name', value: '{{Agent.LastName}}' },
];

export const SAMPLE_DATA = {
    [Language.EN]: {
        lead: {
            firstName: 'John',
            lastName: 'Doe',
            score: 85,
        },
        agent: {
            firstName: 'Jane',
        }
    },
    [Language.EL]: {
         lead: {
            firstName: 'Γιάννης',
            lastName: 'Παπαδόπουλος',
            score: 85,
        },
        agent: {
            firstName: 'Μαρία',
        }
    }
};
