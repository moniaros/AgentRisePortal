// FIX: Correct import path
import { Language } from '../types';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Simple unique ID generator to avoid needing an external library
const simpleUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const SESSION_ID_KEY = 'app_session_id';
const USER_ROLE = 'agent'; // Hardcoded for this app version

/**
 * Initializes the user session, creating a new session ID if one doesn't exist in sessionStorage.
 */
export const initSession = (): void => {
    if (!sessionStorage.getItem(SESSION_ID_KEY)) {
        sessionStorage.setItem(SESSION_ID_KEY, simpleUUID());
    }
};

/**
 * Pushes a structured event to the Google Tag Manager dataLayer.
 * @param eventData - The core event data, including the 'event' name.
 * @param language - The current language of the application.
 */
const pushToDataLayer = (eventData: Record<string, any>, language: Language): void => {
    window.dataLayer = window.dataLayer || [];
    
    const dataLayerPayload = {
        ...eventData,
        language,
        user_role: USER_ROLE,
        session_id: sessionStorage.getItem(SESSION_ID_KEY),
    };

    // Log to console for debugging purposes in a real-world scenario.
    console.log('[Analytics] Pushing to dataLayer:', dataLayerPayload);
    window.dataLayer.push({ ecommerce: null }); // Clear the e-commerce object
    window.dataLayer.push(dataLayerPayload);
};

/**
 * Tracks a generic user event.
 * @param eventName - The GTM event name (e.g., 'engagement').
 * @param eventCategory - The category for the event (e.g., 'AI Tools').
 * @param eventAction - The specific action taken (e.g., 'gap_analysis_success').
 * @param eventLabel - An optional label for context.
 * @param language - The current application language.
 */
export const trackEvent = (
    eventName: string,
    eventCategory: string,
    eventAction: string,
    eventLabel: string | undefined,
    language: Language
): void => {
    pushToDataLayer({
        event: eventName,
        event_category: eventCategory,
        event_action: eventAction,
        event_label: eventLabel,
    }, language);
};

/**
 * Tracks a page view event.
 * @param path - The path of the page being viewed (e.g., '/dashboard').
 * @param language - The current application language.
 */
export const trackPageView = (path: string, language: Language): void => {
    pushToDataLayer({
        event: 'page_view',
        page_path: path,
    }, language);
};

/**
 * Tracks a user interaction within the CRM.
 * @param action - The specific action taken (e.g., 'add_customer').
 * @param label - An optional label for context (e.g., the customer ID).
 * @param language - The current application language.
 */
export const trackCrmAction = (action: string, label: string, language: Language): void => {
    pushToDataLayer({
        event: 'crm_interaction',
        event_category: 'CRM',
        event_action: action,
        event_label: label,
    }, language);
};

/**
 * Tracks a user interaction on the Lead Generation page.
 * @param action - The specific action taken (e.g., 'filter_leads').
 * @param label - An optional label for context (e.g., 'Source: Facebook').
 * @param language - The current application language.
 */
export const trackLeadGenAction = (action: string, label: string, language: Language): void => {
    pushToDataLayer({
        event: 'lead_gen_interaction',
        event_category: 'Lead Generation',
        event_action: action,
        event_label: label,
    }, language);
};

/**
 * Tracks a user interaction related to billing.
 * @param action - The specific action taken (e.g., 'click_pay').
 * @param language - The current application language.
 */
export const trackBillingAction = (action: string, language: Language): void => {
    pushToDataLayer({
        event: 'billing_interaction',
        event_category: 'Billing',
        event_action: action,
    }, language);
};