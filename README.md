# AgentOS - Notification Preferences Feature

This document outlines the Notification Preferences feature added to the Settings page.

## 1. Feature Overview

The Notification Preferences panel allows users to opt-in to receiving real-time browser and sound notifications for critical CRM events, such as the arrival of a new lead.

## 2. Technical Implementation

- **State Management**: The user's preference is managed by the `useNotificationPreferences` custom hook. This hook persists the boolean state to `localStorage` under the key `notification_preferences_enabled`, ensuring the choice is remembered across sessions.

- **Browser Permissions**:
    - The feature utilizes the standard browser **Notification API**.
    - When a user enables the toggle for the first time, the application calls `Notification.requestPermission()`. The preference is only saved and enabled if the user grants permission.
    - If permission is denied, a warning notification is displayed to the user, and the toggle remains in the "off" state. The user must then manually change the permission in their browser's site settings to re-enable the feature.

- **Sound Alerts**:
    - A simple, non-intrusive sound alert is played alongside the visual browser notification to draw the user's attention.
    - The sound is an embedded Base64 WAV data URI located in `constants/sounds.ts`. This avoids the need for external file dependencies and is played using the browser's native `Audio` constructor.

- **Demo Functionality & User Experience**:
    - To provide immediate feedback and confirm the setup, a demo notification (both visual and audible) is triggered immediately after the user grants permission.
    - A "Preview Demo Notification" link is also available within the settings panel, allowing users to test the notification's appearance and sound at any time.
    - The content of this demo notification, along with all UI labels, is fully localized in both English and Greek.
    
     <!-- Placeholder for screenshot -->

## 3. Side Effects & Considerations

- **User Interruption**: As this feature generates system-level notifications, it is designed as an opt-in to respect the user's workflow and avoid unwanted interruptions.
- **Browser Support**: The feature relies on browser support for the Notification API. A check is in place to inform users if their browser is not supported.
- **Future Extension**: The `notificationService.ts` is built to be extensible. New notification types for different CRM events (e.g., "New Message", "Task Assigned") can be easily added by calling the core `showBrowserNotification` and `playSound` functions with different localized content.

## 4. Sales Pipeline Feature

This feature introduces a comprehensive workflow for managing leads and sales opportunities.

-   **Data Models**: The feature uses several new data entities, including `TransactionInquiry` (for new leads), `Opportunity__EXT` (for sales deals), `Prospect`, and `Interaction` (for communication logs). All data is simulated via mock JSON files.
-   **Leads Inbox**: A new page (`/pipeline/inbox`) lists all incoming `TransactionInquiry` records that haven't been converted into an opportunity. This is the agent's first point of contact with a new prospect.
-   **Opportunity Kanban Board**: The main interface (`/pipeline/board`) is a drag-and-drop Kanban board that visualizes opportunities across stages: New, Contacted, Proposal, Won, and Lost. Agents can move cards between stages to update the opportunity's status.
-   **My Day Dashboard**: A personalized dashboard (`/pipeline/my-day`) helps agents prioritize their daily tasks by showing opportunities that are overdue, due today, or have no follow-up date set.
-   **Analytics**: When an opportunity is moved to the 'Won' stage, a `Conversion` event is logged. KPIs such as total leads, conversion rate, and gross written premium (GWP) won are displayed to track performance.
-   **Data & State Management**: A new hook, `usePipelineData`, is responsible for fetching and managing all state related to the sales pipeline, ensuring tenant isolation by filtering all data by the logged-in agent's `agencyId`.

## 5. Policy Data Review Modal

After a policy document is uploaded and parsed by the AI on the **AI Policy Scanner** page, this modal workflow allows the agent to review, edit, and approve the extracted data before it is saved to the CRM.

### 5.1 UI & Editing

-   **Trigger**: The modal automatically opens after the AI successfully extracts data from an uploaded policy document.
-   **Layout**: The modal is organized into logical, collapsible sections: Policyholder Info, Policy Details, Coverages, and Beneficiaries.
-   **Editing**: All extracted fields are presented in editable form controls. Agents can correct any parsing errors or add missing information.
-   **Dynamic Fields**: The "Coverages" and "Beneficiaries" sections allow agents to dynamically add or remove rows, providing full control over list-based data.
-   **Validation**: Real-time validation (using `react-hook-form`) is implemented for required fields like Policy Number and Policyholder Name to ensure data integrity.

### 5.2 "Approve & Save" Logic

Clicking "Approve & Save" triggers a comprehensive synchronization process managed by the `usePolicyCrmSync` hook:

1.  **Customer Matching**: The system checks if a customer with the same first and last name as the policyholder already exists in the CRM.
2.  **New Customer Creation**: If no match is found, a new customer record is created in the CRM using the validated data from the modal.
3.  **Existing Customer Update**: If a match is found, the existing customer's record is updated.
4.  **Policy Handling**:
    -   The system checks if a policy with the same policy number already exists for that customer.
    -   If it exists, it's updated with the new details from the modal.
    -   If it's a new policy, it's added to the customer's list of policies.
5.  **Beneficiary Management**: Each beneficiary in the modal is checked. If they are not already linked to the policy, they are added.
6.  **Feedback**: Upon successful completion, a success notification is displayed, the modal closes, and the user can proceed with the gap analysis using the now-verified data.

### 5.3 Error Handling

-   If the user tries to save with invalid or missing required data, the modal remains open, and error messages are displayed next to the relevant fields.
-   If the save process fails for any other reason (simulated API error), an error notification is shown, and the user can retry the operation.