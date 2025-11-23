
import { AuditLog } from '../types';

const AUDIT_STORAGE_KEY = 'audit_log';

export const logAuditEvent = (
    action: string, 
    target: string, 
    details: string, 
    actor: string = 'System'
): void => {
    const newEntry: AuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agencyId: 'current_agency', // In a real app, get from context
        timestamp: new Date().toISOString(),
        actorName: actor,
        action: action as any, // Casting for loose typing in this mock
        targetName: target,
        details: details
    };

    try {
        const existingLogs = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([newEntry, ...existingLogs]));
        console.log(`[AUDIT] ${action}: ${target} - ${details}`);
    } catch (e) {
        console.error("Failed to write to audit log", e);
    }
};

export const getAuditLogs = (): AuditLog[] => {
    try {
        return JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
};
