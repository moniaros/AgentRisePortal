# End-to-End Test Plan: AI Policy Scanner Workflow

This document outlines the end-to-end testing procedure for the AI Policy Scanner feature, from document upload to CRM data integration and UI validation.

## 1. Objective

To verify the complete, uninterrupted flow of uploading an insurance policy document, parsing it with Google Gemini, storing the structured data, synchronizing it with the main CRM data model, and accurately displaying and updating it in the customer profile UI.

## 2. Prerequisites

1.  User is logged into the application.
2.  A valid Google Gemini API key is saved in **Settings > API & Integration Setup**.
3.  The application's `localStorage` is in a clean state (or relevant keys like `agentos_acord_policies` and `audit_log` are cleared).
4.  The example motor policy PDF is available for upload.

---

## 3. Test Cases

### Test Case 1: Happy Path - New Customer & Policy

**Objective:** Verify the standard workflow for a policy belonging to a customer not yet in the CRM.

| Step | Action | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| 1.1 | Navigate to the **AI Policy Scanner** page. | The file uploader component is displayed. | |
| 1.2 | Drag and drop the example motor policy PDF into the uploader, or use the file browser. | - The file is accepted. <br> - A loading state appears with the message "Extracting policy data...". | |
| 1.3 | Wait for the AI processing to complete. | - The loading state disappears. <br> - The **Policy Review** and **Customer Needs** sections appear. <br> - The "Extracted Policy Information" section is populated with data matching the PDF (e.g., Policy Number, Insurer, Policyholder Name, Coverages). | |
| 1.4 | **Verification:** Open browser developer tools and inspect `localStorage`. | An entry for the customer's policy, structured in ACORD format, should exist under the `agentos_acord_policies` key. The `lastUpdated` timestamp should be recent. | |
| 1.5 | Navigate to the **Micro-CRM** page. | The page loads, showing the current list of customers and recent leads. | |
| 1.6 | Click the **"Sync Policies from Storage"** button. | - A loading indicator appears on the button. <br> - After a short delay, a success notification appears stating that 1 new customer and their policies have been synced. <br> - A new customer record for **"ΜΟΝΙΑΡΟΣ ΙΩΑΝΝΗΣ ΧΡΗΣΤ"** appears in the customer table. | |
| 1.7 | Click **"View Profile"** for the newly created customer. | The Customer Profile page loads. | |
| 1.8 | **Verification:** Inspect the **Policies** section. | - A `DetailedPolicyView` component is rendered for the motor policy. <br> - All data (Policy #, Insurer, Dates, Coverages, Vehicle) should match the data parsed from the PDF. | |
| 1.9 | In the **Coverages** table, click on the "Limit" value for "Σωματικές Βλάβες τρίτων". | The text becomes an input field. | |
| 1.10 | Change the value from "1.300.000" to "1.500.000" and press Enter or click away. | The input field reverts to text, displaying the new value "1.500.000". The change is saved in the application's state. | |

### Test Case 2: Error Handling - AI Parsing & Validation Failure

**Objective:** Verify the system's resilience and user recovery options when the AI fails to return valid data.

| Step | Action | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| 2.1 | (Simulated) Modify the `GapAnalysis.tsx` component to force the `JSON.parse()` call to fail or for the `policyValidator.ts` to return errors (e.g., by making `policyNumber` a mandatory field and having the AI not return it). | - | |
| 2.2 | Upload the motor policy PDF. | - After the loading state, instead of the results, the **Data Correction Form** appears. <br> - An error message is displayed, detailing the missing or invalid fields (e.g., "Policy Number is a required field."). <br> - The form fields are pre-populated with any data that *was* successfully extracted. | |
| 2.3 | **Verification:** Inspect `localStorage`. | An entry should be added to the `audit_log` key, containing the type `VALIDATION_ERROR`, the policyholder name, and the specific validation errors. | |
| 2.4 | Manually enter a valid policy number into the input field and click **"Save and Continue"**. | The correction form disappears, and the workflow proceeds to the **Policy Review** and **Customer Needs** step, using the corrected data. | |
| 2.5 | Start the test again. After the correction form appears, click **"Re-upload Document"**. | The entire component state resets, returning the user to the initial file uploader view, ready to start over. | |

### Test Case 3: Update Existing Customer

**Objective:** Verify that syncing a policy for an existing customer updates their record instead of creating a duplicate.

| Step | Action | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| 3.1 | Ensure the customer "ΜΟΝΙΑΡΟΣ ΙΩΑΝΝΗΣ ΧΡΗΣΤ" exists in the CRM from Test Case 1. | - | |
| 3.2 | In `localStorage`, clear the `agentos_acord_policies` key to simulate a fresh upload session. | The key is empty. | |
| 3.3 | Go to the **AI Policy Scanner** and upload a *different* policy PDF (or re-upload the same one to simulate an amendment). | The AI parsing completes successfully. The data is saved to `localStorage`. | |
| 3.4 | Navigate to the **Micro-CRM** page and click **"Sync Policies from Storage"**. | - A success notification appears. <br> - **Crucially, no new customer is created.** The existing customer record remains. | |
| 3.5 | Navigate to the customer's profile page. | The **Policies** section now shows the newly uploaded policy alongside the original one (or shows the updated details if the same policy number was used). | |

---

## 4. Known Issues & Limitations

-   **OCR Simulation:** The current workflow simulates the OCR/text extraction step using a pre-filled JSON object (`fetchParsedPolicy`). Real-world performance will depend on the accuracy of an actual OCR service on various document qualities.
-   **Customer Matching Logic:** The synchronization logic matches stored policies to existing CRM customers based on a simple `firstName` and `lastName` comparison. This is fragile and could fail with slight name variations (e.g., "John Smith" vs. "Jonathan Smith"). A production system would require a more robust matching algorithm or a user-driven confirmation step.
-   **Date Extraction:** The `acordMapper.ts` service currently uses placeholder dates. A full implementation would require the AI prompt to be enhanced to reliably extract `effectiveDate` and `expirationDate` from the document text.
