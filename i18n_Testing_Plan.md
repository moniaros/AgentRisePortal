# Internationalization (i18n) & Localization (L10n) Test Plan

**Objective:** To conduct a thorough end-to-end test of the platform's localization functionality, ensuring a high-quality, professional, and consistent user experience in both English (en) and Greek (el). This plan also validates that all user-facing copy meets the standard of a world-class insurance provider.

---

## 1. Scope of Testing

-   **Languages:** English (en-US), Greek (el-GR).
-   **Functionality:**
    1.  Language Switching Mechanism.
    2.  UI Text & Label Integrity.
    3.  Data Formatting (Dates, Numbers, Currency).
    4.  Insurance Terminology Accuracy (ACORD Alignment).
    5.  End-to-End User Flows.
    6.  Validation & Error Messaging.
    7.  SEO & Metadata Localization.
    8.  Input Handling.

---

## 2. Test Procedures & Cases

### 2.1. Language Switching Mechanism

| Test Case ID | Action | Expected Outcome |
| :--- | :--- | :--- |
| **I18N-01** | On any page, locate the language toggle (EN/EL). | The toggle is visible and accessible. |
| **I18N-02** | Click the toggle to switch from the current language to the other. | - The entire UI text updates instantly to the selected language. <br> - No page reload occurs. <br> - The state is persistent; navigating to a new page maintains the selected language. |
| **I18N-03** | Refresh the browser page after switching the language. | The page reloads with the user's last selected language preference. |
| **I18N-04** | Clear browser cache/localStorage and reload the application. | The application defaults to Greek (`el`), as it is the primary configured language. |

### 2.2. UI Text & Label Integrity

| Test Case ID | Action | Expected Outcome |
| :--- | :--- | :--- |
| **I18N-05** | Navigate through every page and modal in the application in English. | - All text (labels, buttons, headers, tooltips, placeholders) is grammatically correct, professional, and clear. <br> - There are no missing translations (i.e., no raw translation keys like `nav.dashboard` are visible). <br> - Text fits within UI components without awkward wrapping or overflow. |
| **I18N-06** | Repeat **I18N-05** with the language set to Greek. | - All outcomes from **I18N-05** are met. <br> - All text is correctly translated into natural-sounding, professional Greek. |

### 2.3. Data Formatting

| Test Case ID | Action | Expected Outcome |
| :--- | :--- | :--- |
| **I18N-07** | View a date field (e.g., policy start date, timeline event) in English. | The date format is `MM/DD/YYYY` or another appropriate US-based format. (e.g., 10/25/2023). |
| **I18N-08** | Switch to Greek and view the same date field. | The date format is `DD/MM/YYYY` (e.g., 25/10/2023). |
| **I18N-09** | View a currency field (e.g., premium, potential value) in English and Greek. | The currency symbol (€) and decimal/thousands separators are displayed correctly according to the locale (`€1,200.50`). |
| **I18N-10** | View a number field (e.g., total leads) in both languages. | Thousands separators are correctly applied based on the locale. |

### 2.4. Insurance Terminology Accuracy

| Test Case ID | Action | Expected Outcome |
| :--- | :--- | :--- |
| **I18N-11** | In the CRM, Customer Profile, and AI Policy Scanner, identify key insurance terms. | - **Policy:** `Συμβόλαιο` <br> - **Premium:** `Ασφάλιστρο` <br> - **Coverage:** `Κάλυψη` <br> - **Beneficiary:** `Δικαιούχος` <br> - **Claim:** `Απαίτηση` <br> The translations are consistently and correctly used in all relevant contexts (table headers, form labels, descriptive text). |

### 2.5. End-to-End User Flows

| Test Case ID | Action | Expected Outcome |
| :--- | :--- | :--- |
| **I18N-12** | Complete the **New Customer** creation flow in the CRM entirely in Greek. | All modal titles, labels, placeholders, and buttons are in Greek. The flow completes successfully. |
| **I18N-13** | Complete the **AI Policy Scanner** flow (upload, analyze) entirely in English. | All instructional text, section headers, and results are in clear, professional English. |
| **I18N-14** | Complete the **AI Reply Generation** flow on the Dashboard in Greek. | The prompt to the AI is correctly structured. The UI for displaying the reply and posting it is fully translated. |

### 2.6. Validation & Error Messaging

| Test Case ID | Action | Expected Outcome |
| :--- | :--- | :--- |
| **I18N-15** | In the "Invite User" modal, submit the form with an invalid email address while in Greek. | The validation message "Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email." appears and is grammatically correct. |
| **I18N-16** | In the "Add Customer" form, submit without filling a required field while in English. | A message like "The First Name field is required." appears. The message is clear and professional. |
| **I18N-17** | Simulate an API error (e.g., disconnect from the internet) on the Dashboard. | The error message is fully translated and understandable in the selected language. |

### 2.7. SEO & Metadata

| Test Case ID | Action | Expected Outcome |
| :--- | :--- | :--- |
| **I18N-18** | Navigate to the `/news` page and inspect the browser tab title and `<meta name="description">` tag. | The title and description are in the currently selected language, with no fallback text or errors. |
| **I18N-19** | Navigate to a specific news article page (e.g., `/news/some-article`). | The browser tab title and meta description are updated specifically for that article, in the correct language. |

### 2.8. Input Handling

| Test Case ID | Action | Expected Outcome |
| :--- | :--- | :--- |
| **I18N-20** | In a search bar or form field, input text with Greek characters (e.g., "Παπαδόπουλος"). | The input is accepted, and search/filtering functions correctly with the Greek characters. |

---

## 3. Copywriting & Tone of Voice Audit

In addition to functional testing, a full audit of all strings in `data/locales/en.json` and `data/locales/el.json` was performed.

**Guidelines:**
-   **Tone:** Formal, professional, clear, and customer-focused.
-   **Clarity:** Avoid jargon where possible. Use active voice.
-   **Consistency:** Use the same terminology for the same concepts throughout the app (e.g., "Customer" vs. "Client").
-   **Bilingual Parity:** Ensure the Greek translation captures the same professional tone and meaning as the improved English copy, rather than being a direct literal translation.

**Outcome:** All strings have been reviewed and updated to meet this standard, resulting in a more polished and enterprise-ready application.
